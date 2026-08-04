import styles from "./SoundTrigger.module.css";

import AudioIcon from "@/assets/Audio.svg?react";
import PinIcon from "@/assets/Pin.svg?react";

interface SoundTriggerProps {
  name: string;
  emoji: string;
}

export default function SoundTrigger({name, emoji}: SoundTriggerProps) {
  return (
    <div className={styles.container}>
      <div className={`${styles.main} unselectable`}>
        <div className={styles.emoji}>{emoji}</div>
        <div className={styles.name}>{name}</div>
      </div>
      <div className={styles.other}>
        <div className={`${styles.clickable} unselectable`}>
          <div className={styles.icon}><AudioIcon/></div>
          <div className={styles.text}>Preview</div>
        </div>
        <div className={`${styles.clickable} unselectable`}>
          <div className={styles.icon}><PinIcon/></div>
          <div className={styles.text}>Pin</div>
        </div>
      </div>
    </div>
  );
}
