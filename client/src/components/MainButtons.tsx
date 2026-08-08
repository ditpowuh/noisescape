import styles from "./MainButtons.module.css";
import {useShallow} from "zustand/react/shallow";

import {useSoundboardStore} from "@/stores/SoundboardStore";

import PlusIcon from "@/assets/Plus.svg?react";

export default function MainButtons() {
  const [setActivePanel] = useSoundboardStore(useShallow((state) => [state.setActivePanel]));

  return (
    <div className={styles.bar}>
      <button className={styles.button} onClick={() => setActivePanel("AddSound")}><PlusIcon/></button>
    </div>
  );
}
