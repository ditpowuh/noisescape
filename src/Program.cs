using System;
using System.IO;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Drawing;
using System.Diagnostics;

using Photino.NET;
using Photino.NET.Server;

using NAudio.Wave;
using NAudio.CoreAudioApi;

using Velopack;

namespace Noisescape;

class Program {
  #if DEBUG
    public static bool debugMode = true;
  #else
    public static bool debugMode = false;
  #endif

  static MMDeviceEnumerator enumerator = new MMDeviceEnumerator();

  static OrderedDictionary<string, MMDevice> inputDevices = new OrderedDictionary<string, MMDevice>();
  static OrderedDictionary<string, MMDevice> outputDevices = new OrderedDictionary<string, MMDevice>();

  static IWavePlayer? currentlyPlayingDevice;
  static CancellationTokenSource? previewCTS;

  static readonly object soundPlaybackLock = new object();

  static List<IWavePlayer> activeSoundPlayers = new List<IWavePlayer>();
  static CancellationTokenSource soundPlaybackCTS = new CancellationTokenSource();

  static WasapiCapture? microphoneCapture;
  static WasapiOut? microphoneOutput;
  static BufferedWaveProvider? microphoneBuffer;

  static readonly object microphonePassthroughLock = new object();

  static bool microphonePassthroughEnabled = false;

  static Settings settings = new Settings();

  static OrderedDictionary<Guid, Sound> sounds = new OrderedDictionary<Guid, Sound>();

  const int playbackSleepInterval = 100;

  [STAThread]
  static void Main(string[] args) {
    if (!debugMode) {
      VelopackApp.Build().Run();
    }

    PhotinoServer.CreateStaticFileServer(args, out string baseUrl).RunAsync();
    string appUrl = debugMode ? "http://localhost:5173" : $"{baseUrl}/index.html";

    PhotinoWindow window = new PhotinoWindow();

    window.SetTitle("Noisescape (Soundboard)");
    window.SetSize(1600, 900);
    window.Center();
    window.SetContextMenuEnabled(false);
    window.SetIconFile(debugMode ? "../client/public/Icon.ico" : "Icon.ico");

    window.WindowCreated += (sender, e) => {
      window.SetMinSize(1280, 720);
    };

    window.RegisterWebMessageReceivedHandler((object? sender, string message) => {
      JsonObject? data = JsonSerializer.Deserialize<JsonObject>(message);

      if (data == null) {
        return;
      }

      string? eventName = data["name"]?.GetValue<string>();
      if (string.IsNullOrEmpty(eventName)) {
        return;
      }

      switch (eventName) {
        case "InitialLoad": {
          var responseData = new {
            name = "InitialLoad",
            inputDevices = inputDevices.Keys.ToList(),
            outputDevices = outputDevices.Keys.ToList(),
            inputIndex = settings.inputDevice.index,
            outputIndex = settings.outputDevice.index,
            passthrough = microphonePassthroughEnabled,
            sounds = sounds.Values.Cast<Sound>().ToList()
          };

          string dataMessage = JsonSerializer.Serialize(responseData, new JsonSerializerOptions {
            IncludeFields = true
          });
          window.SendWebMessage(dataMessage);
          window.SetTitle("Noisescape");
          break;
        }
        case "SelectInputDevice": {
          string? deviceName = data["device"]?.GetValue<string>();
          if (string.IsNullOrEmpty(deviceName)) {
            if (debugMode) {
              Console.WriteLine("Invalid selection of input device");
            }
            return;
          }

          int deviceIndex = 0;
          foreach (KeyValuePair<string, MMDevice> device in inputDevices) {
            if (device.Key == deviceName) {
              settings.inputDevice.name = device.Key;
              settings.inputDevice.index = deviceIndex;
            }
            deviceIndex++;
          }
          Storage.SaveSettings(settings);

          if (microphonePassthroughEnabled) {
            StopPassingMicrophone();
            StartPassingMicrophone();
          }
          break;
        }
        case "SelectOutputDevice": {
          string? deviceName = data["device"]?.GetValue<string>();
          if (string.IsNullOrEmpty(deviceName)) {
            if (debugMode) {
              Console.WriteLine("Invalid selection of output device");
            }
            return;
          }

          int deviceIndex = 0;
          foreach (KeyValuePair<string, MMDevice> device in outputDevices) {
            if (device.Key == deviceName) {
              settings.outputDevice.name = device.Key;
              settings.outputDevice.index = deviceIndex;
            }
            deviceIndex++;
          }
          Storage.SaveSettings(settings);

          if (microphonePassthroughEnabled) {
            StopPassingMicrophone();
            StartPassingMicrophone();
          }
          break;
        }
        case "TogglePassthrough": {
          microphonePassthroughEnabled = !microphonePassthroughEnabled;
          if (microphonePassthroughEnabled) {
            StartPassingMicrophone();
          }
          else {
            StopPassingMicrophone();
          }
          break;
        }
        case "TriggerSelect": {
          string? filePath = OpenFileSelectDialog(window, "Select a sound");
          if (filePath != null) {
            var responseData = new {
              name = "SelectedFile",
              filePath = filePath,
              fileName = Path.GetFileName(filePath)
            };

            string dataMessage = JsonSerializer.Serialize(responseData);
            window.SendWebMessage(dataMessage);
          }
          break;
        }
        case "PlayPreview": {
          if (data["path"] != null) {
            string? path = data["path"]?.GetValue<string>();
            float? volume = data["volume"]?.GetValue<float>();
            PlayPreview(path, volume);
          }
          if (data["id"] != null) {
            Guid? id = data["id"]?.GetValue<Guid>();
            if (id != null) {
              Sound sound = sounds[id.Value];
              if (data["volume"] != null) {
                float? volume = data["volume"]?.GetValue<float>();
                PlayPreview(sound.filePath, volume);
              }
              else {
                PlayPreview(sound.filePath, sound.volume);
              }
            }
          }
          break;
        }
        case "StopPreview": {
          StopPreview();
          break;
        }
        case "AddSound": {
          var soundData = data["sound"];

          Sound sound = new Sound();

          if (soundData != null) {
            sound.name = soundData["name"]?.GetValue<string>();
            sound.volume = soundData["volume"]?.GetValue<float>() ?? 1f;
            sound.filePath = soundData["path"]?.GetValue<string>();

            string? emoji = soundData["emoji"]?.GetValue<string>();
            sound.emoji = (emoji == "null") ? null : emoji;
          }

          sounds.Add(sound.id, sound);
          Storage.SaveSounds(sounds);

          var responseData = new {
            name = "AddSound",
            soundGuid = sound.id,
            soundName = sound.name,
            soundEmoji = sound.emoji,
            soundPinned = sound.pinned,
            soundVolume = sound.volume
          };

          string dataMessage = JsonSerializer.Serialize(responseData);
          window.SendWebMessage(dataMessage);
          break;
        }
        case "UpdateSound": {
          var soundData = data["sound"];

          if (soundData != null) {
            Guid? id = soundData["id"]?.GetValue<Guid>();

            if (id != null) {
              if (sounds.ContainsKey(id.Value)) {
                sounds[id.Value].name = soundData["name"]?.GetValue<string>();
                sounds[id.Value].emoji = soundData["emoji"]?.GetValue<string>();
                sounds[id.Value].pinned = soundData["pinned"]?.GetValue<bool>() ?? false;
                sounds[id.Value].volume = soundData["volume"]?.GetValue<float>() ?? 1f;

                Storage.SaveSounds(sounds);
              }
            }
          }
          break;
        }
        case "PlaySound": {
          Guid? id = data["id"]?.GetValue<Guid>();
          if (id != null) {
            Sound sound = sounds[id.Value];
            PlaySound(settings.outputDevice.name, sound.filePath, sound.volume);
          }
          break;
        }
        case "StopAllSounds": {
          StopAllSounds();
          break;
        }
        case "RemoveSound": {
          Guid? id = data["id"]?.GetValue<Guid>();
          if (id != null) {
            sounds.Remove(id.Value);
            Storage.SaveSounds(sounds);
          }
          break;
        }
        case "ShowSoundAsFile": {
          Guid? id = data["id"]?.GetValue<Guid>();
          if (id != null) {
            Sound sound = sounds[id.Value];
            if (sound.filePath != null) {
              Process.Start("explorer.exe", $"/select,\"{sound.filePath}\"");
            }
          }
          break;
        }
        case "TogglePin": {
          Guid? id = data["id"]?.GetValue<Guid>();
          if (id != null) {
            Sound sound = sounds[id.Value];
            sound.pinned = !sound.pinned;
            Storage.SaveSounds(sounds);
          }
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

  static void PlaySound(string? deviceName, string? filePath, float volume = 1f) {
    if (deviceName == null || filePath == null) {
      return;
    }
    string deviceID = outputDevices[deviceName].ID;

    CancellationToken token;
    lock (soundPlaybackLock) {
      token = soundPlaybackCTS.Token;
    }

    Task.Run(() => {
      IWavePlayer? outputDevice = null;
      AudioFileReader? audioFile = null;
      try {
        audioFile = new AudioFileReader(filePath);
        MMDevice targetDevice = enumerator.GetDevice(deviceID);
        outputDevice = new WasapiOut(targetDevice, AudioClientShareMode.Shared, true, 200);

        lock (soundPlaybackLock) {
          if (token.IsCancellationRequested) {
            return;
          }
          activeSoundPlayers.Add(outputDevice);
        }

        audioFile.Volume = volume;
        outputDevice.Init(audioFile);
        outputDevice.Play();

        while (outputDevice.PlaybackState == PlaybackState.Playing) {
          if (token.IsCancellationRequested) {
            outputDevice.Stop();
            break;
          }
          Thread.Sleep(playbackSleepInterval);
        }
      }
      finally {
        if (outputDevice != null) {
          lock (soundPlaybackLock) {
            activeSoundPlayers.Remove(outputDevice);
          }
          outputDevice.Dispose();
        }
        audioFile?.Dispose();
      }
    });

    Task.Run(() => {
      IWavePlayer? outputDevice = null;
      AudioFileReader? audioFile = null;
      try {
        audioFile = new AudioFileReader(filePath);
        outputDevice = new WasapiOut();

        lock (soundPlaybackLock) {
          if (token.IsCancellationRequested) {
            return;
          }
          activeSoundPlayers.Add(outputDevice);
        }

        audioFile.Volume = volume;
        outputDevice.Init(audioFile);
        outputDevice.Play();

        while (outputDevice.PlaybackState == PlaybackState.Playing) {
          if (token.IsCancellationRequested) {
            outputDevice.Stop();
            break;
          }
          Thread.Sleep(playbackSleepInterval);
        }
      }
      finally {
        if (outputDevice != null) {
          lock (soundPlaybackLock) {
            activeSoundPlayers.Remove(outputDevice);
          }
          outputDevice.Dispose();
        }
        audioFile?.Dispose();
      }
    });
  }

  static void StopAllSounds() {
    lock (soundPlaybackLock) {
      try {
        soundPlaybackCTS.Cancel();
      }
      catch {}

      foreach (IWavePlayer player in activeSoundPlayers.ToArray()) {
        try {
          player.Stop();
        }
        catch {}
      }
      activeSoundPlayers.Clear();
      soundPlaybackCTS = new CancellationTokenSource();
    }
  }

  static void PlayPreview(string? filePath, float? volume = 1f) {
    if (filePath == null || volume == null) {
      return;
    }
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

          audioFile.Volume = volume.Value;
          outputDevice.Init(audioFile);
          outputDevice.Play();

          while (outputDevice.PlaybackState == PlaybackState.Playing) {
            if (token.IsCancellationRequested) {
              outputDevice.Stop();
              break;
            }
            Thread.Sleep(playbackSleepInterval);
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
          WasapiOut? device = currentlyPlayingDevice as WasapiOut;
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

  static void StartPassingMicrophone() {
    if (settings.inputDevice.name == null || settings.outputDevice.name == null) {
      return;
    }

    lock (microphonePassthroughLock) {
      try {
        if (!inputDevices.ContainsKey(settings.inputDevice.name) || !outputDevices.ContainsKey(settings.outputDevice.name)) {
          return;
        }

        MMDevice inputDevice = inputDevices[settings.inputDevice.name];
        MMDevice outputDevice = outputDevices[settings.outputDevice.name];

        microphoneCapture = new WasapiCapture(inputDevice);

        microphoneBuffer = new BufferedWaveProvider(microphoneCapture.WaveFormat) {
          DiscardOnBufferOverflow = true,
          BufferDuration = TimeSpan.FromMilliseconds(500)
        };

        microphoneCapture.DataAvailable += (s, e) => {
          microphoneBuffer?.AddSamples(e.Buffer, 0, e.BytesRecorded);
        };

        microphoneCapture.RecordingStopped += (s, e) => {
          if (debugMode && e.Exception != null) {
            Console.WriteLine($"Microphone capture stopped with error: {e.Exception.Message}");
          }
        };

        microphoneOutput = new WasapiOut(outputDevice, AudioClientShareMode.Shared, true, 50);
        microphoneOutput.Init(microphoneBuffer);

        microphoneCapture.StartRecording();
        microphoneOutput.Play();
      }
      catch (Exception ex) {
        if (debugMode) {
          Console.WriteLine($"Error starting passthrough: {ex.Message}");
        }
        StopPassingMicrophone();
      }
    }
  }

  static void StopPassingMicrophone() {
    lock (microphonePassthroughLock) {
      try {
        microphoneCapture?.StopRecording();
      }
      catch {}

      try {
        microphoneOutput?.Stop();
      }
      catch {}

      microphoneCapture?.Dispose();
      microphoneOutput?.Dispose();

      microphoneCapture = null;
      microphoneOutput = null;
      microphoneBuffer = null;
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
