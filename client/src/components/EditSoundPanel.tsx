import styles from "./SoundPanel.module.css";
import {useShallow} from "zustand/react/shallow";
import clsx from "clsx";

import {useSoundboardStore} from "@/stores/SoundboardStore";

import EmojiPicker, {Theme, EmojiStyle, SuggestionMode} from "emoji-picker-react";

import {useRecordHotkeys} from "react-hotkeys-hook";

import {motion} from "motion/react";

import CloseIcon from "@/assets/Close.svg?react";
import DeleteIcon from "@/assets/Delete.svg?react";

import external from "@/lib/external";

import type {Sound} from "@/types/sound";
import type {EmojiClickData} from "emoji-picker-react";

export default function EditSoundPanel() {
  const [updateSound, removeSound] = useSoundboardStore(useShallow((state) => [state.updateSound, state.removeSound]));
  const [setActivePanel] = useSoundboardStore(useShallow((state) => [state.setActivePanel]));
  const [currentlyEditingSound, setCurrentlyEditingSound, updateCurrentlyEditingSoundAttribute] = useSoundboardStore(useShallow((state) => [state.currentlyEditingSound, state.setCurrentlyEditingSound, state.updateCurrentlyEditingSoundAttribute]));

  const [keys, {start: startRecordingKeys, stop: stopRecordingKeys, resetKeys, isRecording}] = useRecordHotkeys();

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

  const changeKeybindRecordingState = () => {
    if (isRecording) {
      stopRecordingKeys();
      performChange({hotkey: Array.from(keys)});
    }
    else {
      startRecordingKeys();
      performChange({hotkey: []});
    }
  }

  const deleteKeybind = () => {
    resetKeys();
    performChange({hotkey: []});
  }

  const playPreview = () => {
    if (currentlyEditingSound === null) {
      return;
    }
    external.sendCommand({
      name: "PlayPreview",
      id: currentlyEditingSound.sound.id,
      volume: currentlyEditingSound.sound.volume
    });
  }

  const processSaveSound = () => {
    if (currentlyEditingSound === null) {
      return;
    }
    if (currentlyEditingSound.sound.name === "") {
      return;
    }
    external.sendCommand({
      name: "UpdateSound",
      sound: currentlyEditingSound.sound
    });
    updateSound(currentlyEditingSound.sound, currentlyEditingSound.sound.id);
    closePanel();
  }

  const processRemoveSound = () => {
    if (currentlyEditingSound === null) {
      return;
    }
    external.sendCommand({
      name: "RemoveSound",
      id: currentlyEditingSound.sound.id
    });
    removeSound(currentlyEditingSound.sound.id);
    closePanel();
  }

  if (currentlyEditingSound === null) {
    return (
      <>
        <motion.div className={styles.scrim} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.5}}></motion.div>
        <motion.div className={styles.panel} initial={{x: "-50%", y: "-150%"}} animate={{x: "-50%", y: "-50%"}} exit={{x: "-50%", y: "100%"}}>
          <div className={styles.byebye}>👋</div>
        </motion.div>
      </>
    );
  }

  const displayedHotkey = isRecording ? (keys.size > 0 ? Array.from(keys).join("+") : "No hotkey set") : (currentlyEditingSound?.sound.hotkey.length > 0 ? currentlyEditingSound.sound.hotkey.join("+") : "No hotkey set");

  return (
    <>
      <motion.div className={styles.scrim} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.5}}></motion.div>
      <motion.div className={styles.panel} initial={{x: "-50%", y: "-150%"}} animate={{x: "-50%", y: "-50%"}} exit={{x: "-50%", y: "100%"}}>
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
              <button className={clsx(styles.actionbutton, styles.danger)} onClick={processRemoveSound}>
                Remove Sound
              </button>
            </div>
            <div className={styles.section}>
              <div className={styles.label}>Keybind</div>
              <div>
                <div className={styles.keybind}>
                  <div className={styles.text} title={displayedHotkey}>
                    {displayedHotkey}
                  </div>
                  <div className={styles.keybindbuttons}>
                    {(currentlyEditingSound.sound.hotkey.length > 0 && !isRecording) && (
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
              <button className={clsx(styles.actionbutton, currentlyEditingSound.sound.name === "" && styles.unavailable)} onClick={processSaveSound}>
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
      </motion.div>
    </>
  );
}
