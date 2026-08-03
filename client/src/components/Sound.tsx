import styles from "./Sound.module.css";

import AudioIcon from "@/assets/Audio.svg?react";
import PinIcon from "@/assets/Pin.svg?react";

interface SoundProps {
  name: string;
  emoji: string;
}

export default function Sound({name, emoji}: SoundProps) {
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
