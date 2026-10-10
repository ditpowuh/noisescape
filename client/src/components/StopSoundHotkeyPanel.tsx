import styles from "./SoundPanel.module.css";
import {useState, useEffect} from "react";
import {useShallow} from "zustand/react/shallow";
import clsx from "clsx";

import {useSoundboardStore} from "@/stores/SoundboardStore";

import {useRecordHotkeys} from "react-hotkeys-hook";

import {motion} from "motion/react";

import CloseIcon from "@/assets/Close.svg?react";
import DeleteIcon from "@/assets/Delete.svg?react";

import external from "@/lib/external";

export default function StopSoundHotkeyPanel() {
  const [closing, setClosing] = useState<boolean>(false);
  const [stopHotkey, setStopHotkey] = useState<string[]>([]);

  const [setActivePanel] = useSoundboardStore(useShallow((state) => [state.setActivePanel]));

  const [keys, {start: startRecordingKeys, stop: stopRecordingKeys, resetKeys, isRecording}] = useRecordHotkeys();

  const closePanel = () => {
    setClosing(true);
    setActivePanel(null);
  }

  const changeHotkeyRecordingState = () => {
    if (isRecording) {
      stopRecordingKeys();
    }
    else {
      resetKeys();
      startRecordingKeys();
    }
  }

  const deleteHotkey = () => {
    resetKeys();
    setStopHotkey([]);
    external.sendCommand({
      name: "SetStopSoundsHotkey",
      hotkey: []
    });
  }

  const saveHotkey = () => {
    if (isRecording) {
      return;
    }
    if (keys.size > 0) {
      external.sendCommand({
        name: "SetStopSoundsHotkey",
        hotkey: Array.from(keys)
      });
    }
    closePanel();
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isRecording && !closing) {
        closePanel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isRecording, closing]);

  useEffect(() => {
    external.sendCommand({
      name: "GetStopSoundsHotkey"
    });

    external.receiveCommand((message) => {
      switch (message.name) {
        case "GetStopSoundsHotkey": {
          setStopHotkey((message.hotkey as string[] | undefined) ?? []);
          break;
        }
      }
    });
  }, []);

  if (closing) {
    return (
      <>
        <motion.div className={styles.scrim} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.5}}></motion.div>
        <motion.div className={`${styles.panel} ${styles.half}`} initial={{x: "-50%", y: "-300%"}} animate={{x: "-50%", y: "-50%"}} exit={{x: "-50%", y: "200%"}}>
          <div className={styles.byebye}>👋</div>
        </motion.div>
      </>
    );
  }

  const currentHotkey = keys.size > 0 ? Array.from(keys) : stopHotkey;
  const displayedHotkey = currentHotkey.length > 0 ? currentHotkey.join("+") : "No hotkey set";
  const hasHotkey = currentHotkey.length > 0;

  return (
    <>
      <motion.div className={styles.scrim} initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.5}}></motion.div>
      <motion.div className={`${styles.panel} ${styles.half}`} initial={{x: "-50%", y: "-300%"}} animate={{x: "-50%", y: "-50%"}} exit={{x: "-50%", y: "200%"}}>
        <div className={styles.start}>
          <div>Set stop hotkey</div>
          <div>
            <button className={styles.closebutton} onClick={closePanel}><CloseIcon/></button>
          </div>
        </div>
        <div className={styles.columns}>
          <div>
            <div className={styles.section}>
              <div className={styles.label}>Hotkey</div>
              <div>
                <div className={styles.keybind}>
                  <div className={styles.text} title={displayedHotkey}>
                    {displayedHotkey}
                  </div>
                  <div className={styles.keybindbuttons}>
                    {(hasHotkey && !isRecording) && (
                      <button onClick={deleteHotkey}>
                        <DeleteIcon/>
                      </button>
                    )}
                    <button className={styles.basicbutton} onClick={changeHotkeyRecordingState}>
                      {isRecording ? "Stop recording" : "Record Hotkey"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.end}>
              <button className={clsx(styles.actionbutton, isRecording && styles.unavailable)} onClick={saveHotkey}>
                Save Hotkey
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
