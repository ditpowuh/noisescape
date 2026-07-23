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

  [STAThread]
  static void Main(string[] args) {
    PhotinoServer.CreateStaticFileServer(args, out string baseUrl).RunAsync();
    string appUrl = debugMode ? "http://localhost:5173" : $"{baseUrl}/index.html";

    PhotinoWindow window = new PhotinoWindow();

    window.SetTitle("NoiseScape");
    window.SetSize(1600, 900);
    window.Center();
    window.SetContextMenuEnabled(false);
    window.RegisterWebMessageReceivedHandler((object sender, string message) => {
      JsonObject data = JsonSerializer.Deserialize<JsonObject>(message);

      switch ((string)data["name"]) {
        case "InitialLoad": {
          var loadData = new {
            name = "InitialLoad",
            inputDevices = "none",
            outputDevices = "none"
          };

          string dataMessage = JsonSerializer.Serialize(loadData);

          window.SendWebMessage(dataMessage);
          break;
        }
        default: {
          break;
        }
      }
      Console.WriteLine($"Received from React: {message}");

      string responseMessage = $"C# Processed your message: {message}";
      window.SendWebMessage(responseMessage);
    });

    window.Load(appUrl);

    GetInputDevices();
    GetOutputDevices();

    window.WaitForClose();
  }

  static void SetDevice() {

  }

  static void PlaySound(string filePath) {

  }

  static void GetInputDevices() {
    MMDeviceCollection devices = enumerator.EnumerateAudioEndPoints(DataFlow.Capture, DeviceState.Active);
    foreach (MMDevice device in devices) {
      Console.WriteLine($"Full Name: {device.FriendlyName}");
    }
  }

  static void GetOutputDevices() {

  }



}
