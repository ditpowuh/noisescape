using System.Threading.Tasks;

using Poss.Win.Automation.GlobalHotKeys;

namespace Noisescape;

static class Hotkeys {

  static readonly Dictionary<string, string> keyAliases = new(StringComparer.OrdinalIgnoreCase) {
    ["bracketleft"] = "OpenBracket",
    ["bracketright"] = "CloseBracket",
    ["backquote"] = "Backtick",
    ["meta"] = "Win",
    ["contextmenu"] = "Apps",
    ["intlbackslash"] = "Backslash",
    ["audiovolumemute"] = "VolumeMute",
    ["audiovolumedown"] = "VolumeDown",
    ["audiovolumeup"] = "VolumeUp",
    ["mediatracknext"] = "MediaNext",
    ["mediatrackprevious"] = "MediaPrev",
    ["mediaplay"] = "MediaPlayPause",
    ["mediapause"] = "MediaPlayPause",
    ["mediaclose"] = "MediaStop",
    ["menu"] = "Apps",
    ["launchapplication1"] = "LaunchApp1",
    ["launchapplication2"] = "LaunchApp2"
  };

  public static GlobalHotKeyManager manager = new GlobalHotKeyManager(new GlobalHotKeyManagerOptions {
    RunMessageLoop = true
  });

  static string BuildKeysString(List<string> hotkey) {
    return string.Join("+", hotkey.Select((key) => {
      string name = key.Trim();
      return keyAliases.TryGetValue(name, out string? keyAlias) ? keyAlias : name;
    }));
  }

  static void RegisterHotkey(string id, Func<Task> action, List<string> hotkey) {
    string keysString = BuildKeysString(hotkey);
    try {
      manager.Register(id, action, keysString);
    }
    catch (ArgumentException error) {
      Console.WriteLine($"Skipping hotkey '{string.Join("+", hotkey)}' for '{id}' - {error.Message}");
    }
  }

  public static void AddHotkey(Sound sound, Action action) {
    RegisterHotkey(sound.id.ToString(), () => {
      action();
      return Task.CompletedTask;
    }, sound.hotkey);
  }

  public static void RemoveHotkey(Sound sound) {
    manager.Unregister(sound.id.ToString());
  }

  public static void AddStopSoundsHotkey(List<string> hotkey, Action stopSoundsAction) {
    RegisterHotkey("StopAllSounds", () => {
      stopSoundsAction();
      return Task.CompletedTask;
    }, hotkey);
  }

  public static void RemoveStopSoundsHotkey() {
    manager.Unregister("StopAllSounds");
  }

}
