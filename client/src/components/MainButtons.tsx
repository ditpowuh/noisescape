import styles from "./MainButtons.module.css";
import {useShallow} from "zustand/react/shallow";

import {useSoundboardStore} from "@/stores/SoundboardStore";

import PlusIcon from "@/assets/Plus.svg?react";
import StopIcon from "@/assets/Stop.svg?react";

import external from "@/lib/external";

export default function MainButtons() {
  const [setActivePanel] = useSoundboardStore(useShallow((state) => [state.setActivePanel]));

  const openAddSoundPanel = () => {
    external.sendCommand({
      name: "StopPreview"
    });
    setActivePanel("AddSound");
  }

  const stopAllSounds = () => {
    external.sendCommand({
      name: "StopAllSounds"
    });
  }

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <button className={styles.button} onClick={openAddSoundPanel} title="Add Sound"><PlusIcon/></button>
      </div>
      <div className={styles.right}>
        <button className={styles.button} onClick={stopAllSounds} title="Stop All Sounds"><StopIcon/></button>
      </div>
    </div>
  );
}
