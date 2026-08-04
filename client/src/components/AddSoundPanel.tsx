import styles from "./AddSoundPanel.module.css";
import {useState, useEffect} from "react";
import clsx from "clsx";

import EmojiPicker, {Theme, EmojiStyle, SuggestionMode} from "emoji-picker-react";
import {AutoTextSize} from "auto-text-size";

import CloseIcon from "@/assets/Close.svg?react";

import external from "@/lib/external";

import type {EmojiClickData} from "emoji-picker-react";

interface AddSoundPanelProps {
  closeSoundPanel: () => void;
}

export default function AddSoundPanel({closeSoundPanel}: AddSoundPanelProps) {
  const [file, setFile] = useState<string>("");
  const [filePath, setFilePath] = useState<string>("");
  const [emoji, setEmoji] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(1);

  const selectEmoji = (emojiObject: EmojiClickData) => {
    setEmoji(emojiObject.emoji);
  }

  const removeEmoji = () => {
    setEmoji(null);
  }

  const openFileSelect = () => {
    external.sendCommand({
      name: "TriggerSelect"
    });
  }

  const playPreview = () => {
    if (file === "" || filePath === "") {
      return;
    }
    external.sendCommand({
      name: "PlayPreview",
      path: filePath,
      volume: volume
    });
  }

  const addSound = () => {

  }

  useEffect(() => {
    external.receiveCommand((message) => {
      switch (message.name) {
        case "SelectedFile": {
          setFile(message.fileName);
          setFilePath(message.filePath);
          break;
        }
        default: {
          break;
        }
      }
    });
  }, []);

  return (
    <>
      <div className={styles.scrim}></div>
      <div className={styles.panel}>
        <div className={styles.start}>
          <div>
            Add a sound
          </div>
          <div>
            <button className={styles.closebutton} onClick={closeSoundPanel}><CloseIcon/></button>
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
                <input className={styles.textinput} type="text"/>
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.label}>Sound Volume</div>
              <div>
                <input className={styles.slider} type="range" min={0} max={1} step={0.01} defaultValue={1} value={volume} onChange={(event) => setVolume(Number(event.target.value))}/>
                <div className={styles.volume}>{volume.toFixed(2)}</div>
              </div>
            </div>
            <div className={styles.end}>
              <button className={styles.actionbutton}>Save Sound</button>
              <button className={clsx(styles.actionbutton, (file === "" || filePath === "") && styles.unavailable)} onClick={playPreview}>Preview</button>
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
