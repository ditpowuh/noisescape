import styles from "./SoundTrigger.module.css";
import {useState} from "react";
import clsx from "clsx";

import external from "@/lib/external";

interface SoundTriggerProps extends React.ComponentProps<"div"> {
  name: string;
  guid: string;
  emoji: string | null;
}

export default function SoundTrigger({name, guid, emoji, ...elementProps}: SoundTriggerProps) {
  const [triggeredEffect, setTriggeredEffect] = useState<boolean>(false);

  const triggerPreview = () => {
    external.sendCommand({
      name: "PlayPreview",
      id: guid
    });
  }

  const playSound = () => {
    external.sendCommand({
      name: "PlaySound",
      id: guid
    });
    setTriggeredEffect(true);
    setTimeout(() => {
      setTriggeredEffect(false);
    }, 500);
  }

  return (
    <div className={styles.container}>
      <div className={clsx(styles.main, triggeredEffect && styles.triggered, "unselectable")} onClick={playSound} {...elementProps}>
        <div className={styles.emoji}>{emoji}</div>
        <div className={styles.name}>{name}</div>
      </div>
      <div className={styles.preview} onClick={triggerPreview}>Preview</div>
    </div>
  );
}
