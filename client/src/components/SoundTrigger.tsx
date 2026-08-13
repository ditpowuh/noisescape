import styles from "./SoundTrigger.module.css";
import {useState, useEffect, useRef} from "react";
import clsx from "clsx";

import PinIcon from "@/assets/Pin.svg?react";

import external from "@/lib/external";

interface SoundTriggerProps extends React.ComponentProps<"div"> {
  name: string;
  guid: string;
  pinned: boolean;
  emoji: string | null;
}

export default function SoundTrigger({name, guid, pinned, emoji, ...elementProps}: SoundTriggerProps) {
  const [triggeredEffect, setTriggeredEffect] = useState<boolean>(false);

  const triggeredEffectTimerRef = useRef<number | null>(null);

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
    if (triggeredEffectTimerRef.current) {
      clearTimeout(triggeredEffectTimerRef.current);
    }
    triggeredEffectTimerRef.current = setTimeout(() => {
      setTriggeredEffect(false);
    }, 500);
  }

  useEffect(() => {
    return () => {
      if (triggeredEffectTimerRef.current) {
        clearTimeout(triggeredEffectTimerRef.current);
      }
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={clsx(styles.main, triggeredEffect && styles.triggered, "unselectable")} onClick={playSound} {...elementProps}>
        <div className={styles.emoji}>{emoji}</div>
        <div className={styles.name} title={name}>{name}</div>
      </div>
      {pinned && (
        <div className={styles.pin}>
          <PinIcon/>
        </div>
      )}
      <div className={styles.preview} onClick={triggerPreview}>Preview</div>
    </div>
  );
}
