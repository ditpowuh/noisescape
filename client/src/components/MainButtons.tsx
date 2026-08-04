import styles from "./MainButtons.module.css";

import PlusIcon from "@/assets/Plus.svg?react";

interface MainButtonsProps {
  openAddSoundPanel: () => void;
}

export default function MainButtons({openAddSoundPanel}: MainButtonsProps) {
  return (
    <div className={styles.bar}>
      <button className={styles.button} onClick={openAddSoundPanel}><PlusIcon/></button>
    </div>
  );
}
