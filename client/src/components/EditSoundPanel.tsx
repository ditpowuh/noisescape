import styles from "./SoundPanel.module.css";
import {useShallow} from "zustand/react/shallow";
import clsx from "clsx";

import {useSoundboardStore} from "@/stores/SoundboardStore";

import EmojiPicker, {Theme, EmojiStyle, SuggestionMode} from "emoji-picker-react";

import CloseIcon from "@/assets/Close.svg?react";

import external from "@/lib/external";

import type {Sound} from "@/types/sound";
import type {EmojiClickData} from "emoji-picker-react";

export default function EditSoundPanel() {
  const [setActivePanel] = useSoundboardStore(useShallow((state) => [state.setActivePanel]));
  const [currentlyEditingSound, setCurrentlyEditingSound, updateCurrentlyEditingSoundAttribute] = useSoundboardStore(useShallow((state) => [state.currentlyEditingSound, state.setCurrentlyEditingSound, state.updateCurrentlyEditingSoundAttribute]));

  const performChange = (change: Partial<Sound>) => {
    updateCurrentlyEditingSoundAttribute(change);
  }

  const selectEmoji = (emojiObject: EmojiClickData) => {
    performChange({emoji: emojiObject.emoji});
  }

  const removeEmoji = () => {
    performChange({emoji: null});
  }

  const closePanel = () => {
    external.sendCommand({
      name: "StopPreview"
    });
    setCurrentlyEditingSound(null);
    setActivePanel(null);
  }

  const playPreview = () => {
    if (currentlyEditingSound === null) {
      return;
    }
    external.sendCommand({
      name: "PlayPreview",
      id: currentlyEditingSound.sound.id
    });
  }

  const saveSound = () => {
    if (currentlyEditingSound === null) {
      return;
    }

  }

  const deleteSound = () => {
    if (currentlyEditingSound === null) {
      return;
    }
    external.sendCommand({
      name: "DeleteSound",
      id: currentlyEditingSound.sound.id
    });
    closePanel();
  }

  if (currentlyEditingSound === null) {
    return null;
  }

  return (
    <>
      <div className={styles.scrim}></div>
      <div className={styles.panel}>
        <div className={styles.start}>
          <div>Edit sound</div>
          <div>
            <button className={styles.closebutton} onClick={closePanel}><CloseIcon/></button>
          </div>
        </div>
        <div className={styles.columns}>
          <div>
            <div className={styles.section}>
              <div className={styles.label}>Sound Name<span className={styles.required}>*</span></div>
              <div>
                <input className={styles.textinput} type="text" placeholder="Sound Name" maxLength={255} value={currentlyEditingSound.sound.name} onChange={(event) => performChange({name: event.target.value})}/>
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.label}>Sound Volume</div>
              <div>
                <input className={styles.slider} type="range" min={0} max={1} step={0.01} defaultValue={1} value={currentlyEditingSound.sound.volume} onChange={(event) => performChange({volume: Number(event.target.value)})}/>
                <div className={styles.volume}>{currentlyEditingSound.sound.volume.toFixed(2)}</div>
              </div>
            </div>
            <div className={styles.section}>
              <div className={styles.label}>Danger Zone</div>
              <button className={clsx(styles.actionbutton, styles.danger)} onClick={deleteSound}>
                Delete Sound
              </button>
            </div>
            <div className={styles.end}>
              <button className={clsx(styles.actionbutton, currentlyEditingSound.sound.name === "" && styles.unavailable)} onClick={saveSound}>
                Save Sound
              </button>
              <button className={styles.actionbutton} onClick={playPreview}>
                Preview
              </button>
            </div>
          </div>
          <div>
            <div className={styles.label}>Emoji</div>
            <EmojiPicker height={300} width="100%" autoFocusSearch={false} theme={Theme.AUTO} emojiStyle={EmojiStyle.NATIVE} skinTonesDisabled={true} previewConfig={{showPreview: false}} suggestedEmojisMode={SuggestionMode.RECENT} onEmojiClick={selectEmoji}/>
            <div className={styles.emojidisplay}>
              {currentlyEditingSound.sound.emoji !== null && (
                <button className={styles.basicbutton} onClick={removeEmoji}>Remove</button>
              )}
              <div className={clsx(styles.emoji, currentlyEditingSound.sound.emoji !== null && styles.selected)}>
                {currentlyEditingSound.sound.emoji === null ? "None" : currentlyEditingSound.sound.emoji}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
