using System;
using System.IO;
using System.Text.Json.Serialization;

namespace Noisescape;

class Sound {

  [JsonPropertyName("path")]
  public string? filePath;
  [JsonPropertyName("name")]
  public string? name;
  [JsonPropertyName("emoji")]
  public string? emoji;

  [JsonPropertyName("pinned")]
  public bool pinned = false;

  [JsonPropertyName("volume")]
  public float volume = 1f;

  [JsonPropertyName("hotkey")]
  public List<string> hotkey = new List<string>();

  [JsonPropertyName("id")]
  public Guid id;

  public Sound() {
    id = Guid.NewGuid();
  }

  [JsonConstructor]
  public Sound(Guid id, string filePath, string name, string emoji, bool pinned, float volume, List<string> hotkey) {
    this.id = id;
    this.filePath = filePath;
    this.name = name;
    this.emoji = emoji;
    this.pinned = pinned;
    this.volume = volume;
    this.hotkey = hotkey;
  }

}
