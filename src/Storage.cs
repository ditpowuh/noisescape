using System;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Noisescape;

static class Storage {

  public static readonly JsonSerializerOptions defaultSerializerOptions = new JsonSerializerOptions {
    IncludeFields = true
  };

  public static readonly JsonSerializerOptions indentedSerializerOptions = new JsonSerializerOptions {
    IncludeFields = true,
    WriteIndented = true
  };

  static readonly string appDataFolder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "Noisescape");

  public static void SaveSettings(Settings settingsData) {
    Directory.CreateDirectory(appDataFolder);
    string jsonData = JsonSerializer.Serialize(settingsData, indentedSerializerOptions);
    File.WriteAllText(Path.Combine(appDataFolder, "settings.json"), jsonData);
  }

  public static Settings? LoadSettings() {
    try {
      string jsonData = File.ReadAllText(Path.Combine(appDataFolder, "settings.json"));
      return JsonSerializer.Deserialize<Settings>(jsonData, defaultSerializerOptions);
    }
    catch (Exception exception) {
      Console.WriteLine($"Failed to load settings: {exception.Message}");
      return null;
    }
  }

  public static void SaveSounds(OrderedDictionary<Guid, Sound> sounds) {
    Directory.CreateDirectory(appDataFolder);
    List<Sound> listOfSounds = sounds.Values.Cast<Sound>().ToList();
    string jsonData = JsonSerializer.Serialize(listOfSounds, indentedSerializerOptions);
    File.WriteAllText(Path.Combine(appDataFolder, "sounds.json"), jsonData);
  }

  public static OrderedDictionary<Guid, Sound> LoadSounds() {
    try {
      string jsonData = File.ReadAllText(Path.Combine(appDataFolder, "sounds.json"));
      List<Sound>? listOfSounds = JsonSerializer.Deserialize<List<Sound>>(jsonData, defaultSerializerOptions);
      if (listOfSounds == null) {
        return new OrderedDictionary<Guid, Sound>();
      }
      OrderedDictionary<Guid, Sound> loadedSounds = new OrderedDictionary<Guid, Sound>();
      foreach (Sound sound in listOfSounds) {
        loadedSounds.Add(sound.id, sound);
      }
      return loadedSounds;
    }
    catch (Exception exception) {
      Console.WriteLine($"Failed to load sounds: {exception.Message}");
      return new OrderedDictionary<Guid, Sound>();
    }
  }

}
