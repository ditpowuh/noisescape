import styles from "./MainButtons.module.css";
import {useShallow} from "zustand/react/shallow";

import {useSoundboardStore} from "@/stores/SoundboardStore";

import PlusIcon from "@/assets/Plus.svg?react";

import external from "@/lib/external";

export default function MainButtons() {
  const [setActivePanel] = useSoundboardStore(useShallow((state) => [state.setActivePanel]));

  const openAddSoundPanel = () => {
    external.sendCommand({
      name: "StopPreview"
    });
    setActivePanel("AddSound");
  }

  return (
    <div className={styles.bar}>
      <button className={styles.button} onClick={openAddSoundPanel}><PlusIcon/></button>
    </div>
  );
}
