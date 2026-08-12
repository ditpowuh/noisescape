using System.Threading.Tasks;

using Poss.Win.Automation.GlobalHotKeys;

namespace Noisescape;

static class Hotkeys {

  public static GlobalHotKeyManager manager = new GlobalHotKeyManager(new GlobalHotKeyManagerOptions {
    RunMessageLoop = true
  });

  public static void AddHotkey(Sound sound, Action action) {
    manager.Register(sound.id.ToString(), () => {
      action();
      return Task.CompletedTask;
    }, string.Join("+", sound.hotkey));
  }

  public static void RemoveHotkey(Sound sound) {
    manager.Unregister(sound.id.ToString());
  }

}
