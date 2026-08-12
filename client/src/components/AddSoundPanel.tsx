import styles from "./SoundPanel.module.css";
import {useState, useEffect} from "react";
import {useShallow} from "zustand/react/shallow";
import clsx from "clsx";

import {useSoundboardStore} from "@/stores/SoundboardStore";

import EmojiPicker, {Theme, EmojiStyle, SuggestionMode} from "emoji-picker-react";
import {AutoTextSize} from "auto-text-size";

import {useRecordHotkeys} from "react-hotkeys-hook";

import CloseIcon from "@/assets/Close.svg?react";
import DeleteIcon from "@/assets/Delete.svg?react";

import external from "@/lib/external";

import type {EmojiClickData} from "emoji-picker-react";

export default function AddSoundPanel() {
  const [file, setFile] = useState<string>("");
  const [filePath, setFilePath] = useState<string>("");
  const [emoji, setEmoji] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(1);
  const [soundName, setSoundName] = useState<string>("");

  const [keys, {start: startRecordingKeys, stop: stopRecordingKeys, resetKeys, isRecording}] = useRecordHotkeys();

  const [setActivePanel] = useSoundboardStore(useShallow((state) => [state.setActivePanel]));

  const selectEmoji = (emojiObject: EmojiClickData) => {
    setEmoji(emojiObject.emoji);
  }

  const removeEmoji = () => {
    setEmoji(null);
  }

  const closePanel = () => {
    external.sendCommand({
      name: "StopPreview"
    });
    setActivePanel(null);
  }

  const openFileSelect = () => {
    external.sendCommand({
      name: "TriggerSelect"
    });
  }

  const changeKeybindRecordingState = () => {
    if (isRecording) {
      stopRecordingKeys();
    }
    else {
      startRecordingKeys();
    }
  }

  const deleteKeybind = () => {
    resetKeys();
  }

  const playPreview = () => {
    if (file === "" || filePath === "" || isRecording) {
      return;
    }
    external.sendCommand({
      name: "PlayPreview",
      path: filePath,
      volume: volume
    });
  }

  const addSound = () => {
    if (file === "" || filePath === "" || soundName === "" || isRecording) {
      return;
    }
    external.sendCommand({
      name: "AddSound",
      sound: {
        path: filePath,
        name: soundName,
        emoji: emoji,
        volume: volume,
        hotkey: Array.from(keys)
      }
    });
    external.sendCommand({
      name: "StopPreview"
    });
    closePanel();
  }

  useEffect(() => {
    external.receiveCommand((message) => {
      switch (message.name) {
        case "SelectedFile": {
          setFile(message.fileName);
          setFilePath(message.filePath);
          break;
        }
      }
    });
  }, []);

  const displayedHotkey = keys.size > 0 ? Array.from(keys).join("+") : "No hotkey set";

  return (
    <>
      <div className={styles.scrim}></div>
      <div className={styles.panel}>
        <div className={styles.start}>
          <div>Add a sound</div>
          <div>
            <button className={styles.closebutton} onClick={closePanel}><CloseIcon/></button>
          </div>
        </div>
        <div className={styles.columns}>
          <div>
            <div className={styles.section}>
              <div className={styles.label}>File<span className={styles.required}>*</span></div>
              <div>
                <div className={styles.fileselect}>
                  <button className={styles.basicbutton} onClick={openFileSelect}>Select</button>
                  <div className={styles.filename} title={file}>{file}</div>
                </div>
                <div className={styles.filepath} title={filePath}>
                  <AutoTextSize mode="oneline" maxFontSizePx={16} minFontSizePx={Number.MIN_SAFE_INTEGER}>{filePath}</AutoTextSize>
                </div>
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.label}>Sound Name<span className={styles.required}>*</span></div>
              <div>
                <input className={styles.textinput} type="text" placeholder="Sound Name" maxLength={255} value={soundName} onChange={(event) => setSoundName(event.target.value)}/>
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.label}>Sound Volume</div>
              <div>
                <input className={styles.slider} type="range" min={0} max={1} step={0.01} defaultValue={1} value={volume} onChange={(event) => setVolume(Number(event.target.value))}/>
                <div className={styles.volume}>{volume.toFixed(2)}</div>
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.label}>Hotkey</div>
              <div>
                <div className={styles.keybind}>
                  <div className={styles.text} title={displayedHotkey}>
                    {displayedHotkey}
                  </div>
                  <div className={styles.keybindbuttons}>
                    {(keys.size > 0 && !isRecording) && (
                      <button onClick={deleteKeybind}>
                        <DeleteIcon/>
                      </button>
                    )}
                    <button className={styles.basicbutton} onClick={changeKeybindRecordingState}>
                      {isRecording ? "Stop recording" : "Record Hotkey"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.end}>
              <button className={clsx(styles.actionbutton, (file === "" || filePath === "" || soundName === "" || isRecording) && styles.unavailable)} onClick={addSound}>
                Save Sound
              </button>
              <button className={clsx(styles.actionbutton, (file === "" || filePath === "" || isRecording) && styles.unavailable)} onClick={playPreview}>
                Preview
              </button>
            </div>
          </div>
          <div>
            <div className={styles.label}>Emoji</div>
            <EmojiPicker height={300} width="100%" autoFocusSearch={false} theme={Theme.AUTO} emojiStyle={EmojiStyle.NATIVE} skinTonesDisabled={true} previewConfig={{showPreview: false}} suggestedEmojisMode={SuggestionMode.RECENT} onEmojiClick={selectEmoji}/>
            <div className={styles.emojidisplay}>
              {emoji !== null && (
                <button className={styles.basicbutton} onClick={removeEmoji}>Remove</button>
              )}
              <div className={clsx(styles.emoji, emoji !== null && styles.selected)}>
                {emoji === null ? "None" : emoji}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
