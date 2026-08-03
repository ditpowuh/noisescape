using System;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace NoiseScape;

static class Storage {

  static readonly string appDataFolder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "Noisescape");

  public static void SaveSettings(Settings settingsData) {
    Directory.CreateDirectory(appDataFolder);
    string jsonData = JsonSerializer.Serialize(settingsData, new JsonSerializerOptions {
      IncludeFields = true,
      WriteIndented = true
    });
    File.WriteAllText(Path.Combine(appDataFolder, "settings.json"), jsonData);
  }

  public static Settings? LoadSettings() {
    try {
      string jsonData = File.ReadAllText(Path.Combine(appDataFolder, "settings.json"));
      return JsonSerializer.Deserialize<Settings>(jsonData, new JsonSerializerOptions {
        IncludeFields = true
      });
    }
    catch (Exception exception) {
      Console.WriteLine($"Failed to load settings: {exception.Message}");
      return null;
    }
  }

  public static void SaveSounds(List<Sound> listOfSounds) {
    Directory.CreateDirectory(appDataFolder);
    string jsonData = JsonSerializer.Serialize(listOfSounds, new JsonSerializerOptions {
      IncludeFields = true,
      WriteIndented = true
    });
    File.WriteAllText(Path.Combine(appDataFolder, "sounds.json"), jsonData);
  }

  public static List<Sound> LoadSounds() {
    try {
      string jsonData = File.ReadAllText(Path.Combine(appDataFolder, "sounds.json"));
      return JsonSerializer.Deserialize<List<Sound>>(jsonData, new JsonSerializerOptions {
        IncludeFields = true
      });
    }
    catch (Exception exception) {
      Console.WriteLine($"Failed to load sounds: {exception.Message}");
      return new List<Sound>();
    }
  }

}
