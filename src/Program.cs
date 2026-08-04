using System;
using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Drawing;

using Photino.NET;
using Photino.NET.Server;

using NAudio.Wave;
using NAudio.CoreAudioApi;

namespace NoiseScape;

class Program {
  #if DEBUG
    public static bool debugMode = true;
  #else
    public static bool debugMode = false;
  #endif

  static MMDeviceEnumerator enumerator = new MMDeviceEnumerator();

  static OrderedDictionary<string, MMDevice> inputDevices = new OrderedDictionary<string, MMDevice>();
  static OrderedDictionary<string, MMDevice> outputDevices = new OrderedDictionary<string, MMDevice>();

  static IWavePlayer currentlyPlayingDevice;
  static CancellationTokenSource previewCTS;

  static Settings settings;

  static List<Sound> sounds = new List<Sound>();

  [STAThread]
  static void Main(string[] args) {
    PhotinoServer.CreateStaticFileServer(args, out string baseUrl).RunAsync();
    string appUrl = debugMode ? "http://localhost:5173" : $"{baseUrl}/index.html";

    PhotinoWindow window = new PhotinoWindow();

    window.SetTitle("NoiseScape");
    window.SetSize(1600, 900);
    window.Center();
    window.SetContextMenuEnabled(false);

    window.WindowCreated += (sender, e) => {
      window.SetMinSize(1280, 720);
    };

    window.RegisterWebMessageReceivedHandler((object sender, string message) => {
      JsonObject data = JsonSerializer.Deserialize<JsonObject>(message);

      switch ((string)data["name"]) {
        case "InitialLoad": {
          var responseData = new {
            name = "InitialLoad",
            inputDevices = inputDevices.Keys.ToList(),
            outputDevices = outputDevices.Keys.ToList(),
            inputIndex = settings.inputDevice.index,
            outputIndex = settings.outputDevice.index
          };

          string dataMessage = JsonSerializer.Serialize(responseData);
          window.SendWebMessage(dataMessage);
          break;
        }
        case "SelectInputDevice": {
          string deviceName = (string)data["device"];

          int deviceIndex = 0;
          foreach (KeyValuePair<string, MMDevice> device in inputDevices) {
            if (device.Key == deviceName) {
              settings.inputDevice.name = device.Key;
              settings.inputDevice.index = deviceIndex;
            }
            deviceIndex++;
          }
          Storage.SaveSettings(settings);
          break;
        }
        case "SelectOutputDevice": {
          string deviceName = (string)data["device"];

          int deviceIndex = 0;
          foreach (KeyValuePair<string, MMDevice> device in outputDevices) {
            if (device.Key == deviceName) {
              settings.outputDevice.name = device.Key;
              settings.outputDevice.index = deviceIndex;
            }
            deviceIndex++;
          }
          Storage.SaveSettings(settings);
          break;
        }
        case "TriggerSelect": {
          string? filePath = OpenFileSelectDialog(window, "Select a sound");
          if (filePath != null) {
            var responseData = new {
              name = "SelectedFile",
              fileName = Path.GetFileName(filePath)
            };

            string dataMessage = JsonSerializer.Serialize(responseData);
            window.SendWebMessage(dataMessage);
          }
          break;
        }
        case "PlayPreview": {
          PlayPreview((string)data["path"], (float)data["volume"]);
          break;
        }
        case "StopPreview": {
          StopPreview();
          break;
        }
        case "AddSound": {
          var soundData = data["sound"];

          Sound sound = new Sound();
          sound.filePath = (string)soundData["path"];
          sound.name = (string)soundData["name"];
          sound.emoji = (string)soundData["emoji"];
          sound.pinned = (bool)soundData["pinned"];
          sound.volume = (float)soundData["volume"];

          sounds.Add(sound);

          Storage.SaveSounds(sounds);
          break;
        }
        default: {
          Console.WriteLine($"Unknown message received - {data["name"]}");
          break;
        }
      }
      if (debugMode) {
        Console.WriteLine($"Received from React: {message}");
      }
    });

    window.Load(appUrl);

    inputDevices = GetInputDevices();
    outputDevices = GetOutputDevices();

    Settings? loadedSettings = Storage.LoadSettings();
    if (loadedSettings == null) {
      settings = new Settings(inputDevices, outputDevices);
    }
    else {
      settings = loadedSettings;
      VerifyDevices();
    }

    sounds = Storage.LoadSounds();

    window.WaitForClose();
  }

  static void PlaySound(string deviceName, string filePath, float volume = 1f) {
    string deviceID = outputDevices[deviceName].ID;

    Task.Run(() => {
      using (var audioFile = new AudioFileReader(filePath))
      using (var targetDevice = enumerator.GetDevice(deviceID))
      using (var outputDevice = new WasapiOut(targetDevice, AudioClientShareMode.Shared, true, 200)) {
        audioFile.Volume = volume;
        outputDevice.Init(audioFile);
        outputDevice.Play();

        while (outputDevice.PlaybackState == PlaybackState.Playing) {
          Thread.Sleep(500);
        }
      }
    });
  }

  static void PlayPreview(string filePath, float volume = 1f) {
    StopPreview();

    previewCTS = new CancellationTokenSource();
    CancellationToken token = previewCTS.Token;

    Task.Run(() => {
      try {
        using (var audioFile = new AudioFileReader(filePath))
        using (var outputDevice = new WasapiOut()) {
          lock (enumerator) {
            if (token.IsCancellationRequested) {
              return;
            }
            currentlyPlayingDevice = outputDevice;
          }

          audioFile.Volume = volume;
          outputDevice.Init(audioFile);
          outputDevice.Play();

          while (outputDevice.PlaybackState == PlaybackState.Playing) {
            if (token.IsCancellationRequested) {
              outputDevice.Stop();
              break;
            }
            Thread.Sleep(500);
          }
        }
      }
      catch (Exception exeption) {
        if (debugMode) {
          Console.WriteLine($"Error with previewing audio: {exeption.Message}");
        }
      }
      finally {
        lock (enumerator) {
          WasapiOut device = currentlyPlayingDevice as WasapiOut;
          if (device != null && device == currentlyPlayingDevice) {
            currentlyPlayingDevice = null;
          }
        }
      }
    }, token);
  }

  static void StopPreview() {
    try {
      previewCTS?.Cancel();
    }
    catch {}

    if (currentlyPlayingDevice != null) {
      try {
        currentlyPlayingDevice.Stop();
        currentlyPlayingDevice.Dispose();
      }
      catch {}
      currentlyPlayingDevice = null;
    }
  }

  static OrderedDictionary<string, MMDevice> GetInputDevices() {
    MMDeviceCollection devices = enumerator.EnumerateAudioEndPoints(DataFlow.Capture, DeviceState.Active);

    OrderedDictionary<string, MMDevice> inputDevicesNames = new OrderedDictionary<string, MMDevice>();
    foreach (MMDevice device in devices) {
      inputDevicesNames.Add(device.FriendlyName, device);
    }

    return inputDevicesNames;
  }

  static OrderedDictionary<string, MMDevice> GetOutputDevices() {
    MMDeviceCollection devices = enumerator.EnumerateAudioEndPoints(DataFlow.Render, DeviceState.Active);

    OrderedDictionary<string, MMDevice> outputDevicesNames = new OrderedDictionary<string, MMDevice>();
    foreach (MMDevice device in devices) {
      outputDevicesNames.Add(device.FriendlyName, device);
    }

    return outputDevicesNames;
  }

  static void VerifyDevices() {
    bool inputDeviceFound = false;
    int inputIndex = 0;
    foreach (KeyValuePair<string, MMDevice> device in inputDevices) {
      if (settings.inputDevice.name == device.Key) {
        settings.inputDevice.index = inputIndex;
        inputDeviceFound = true;
        break;
      }
      inputIndex++;
    }
    if (!inputDeviceFound) {
      if (settings.inputDevice.index > inputDevices.Count - 1) {
        settings.inputDevice.index = 0;
      }
      settings.inputDevice.name = inputDevices.GetAt(settings.inputDevice.index).Key;
    }

    bool outputDeviceFound = false;
    int outputIndex = 0;
    foreach (KeyValuePair<string, MMDevice> device in outputDevices) {
      if (settings.outputDevice.name == device.Key) {
        settings.outputDevice.index = outputIndex;
        outputDeviceFound = true;
        break;
      }
      outputIndex++;
    }
    if (!outputDeviceFound) {
      if (settings.outputDevice.index > outputDevices.Count - 1) {
        settings.outputDevice.index = 0;
      }
      settings.outputDevice.name = outputDevices.GetAt(settings.outputDevice.index).Key;
    }
  }

  static string? OpenFileSelectDialog(PhotinoWindow window, string title) {
    string defaultPath = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
    var filters = new (string Name, string[] Extensions)[] {
      ("Audio files", new[] {"*.wav", "*.mp3"})
    };

    string[] selectedFiles = window.ShowOpenFile(title, defaultPath, false, filters);

    if (selectedFiles != null && selectedFiles.Length > 0) {
      Console.WriteLine(selectedFiles[0]);
      return selectedFiles[0];
    }
    else {
      return null;
    }
  }

}
