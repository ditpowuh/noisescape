import styles from "./SoundTrigger.module.css";

import external from "@/lib/external";

interface SoundTriggerProps extends React.ComponentProps<"div"> {
  name: string;
  guid: string;
  emoji: string;
}

export default function SoundTrigger({name, guid, emoji, ...elementProps}: SoundTriggerProps) {
  console.log(name)
  console.log(guid)
  console.log(emoji)

  const triggerPreview = () => {
    external.sendCommand({
      name: "PlayPreview",
      id: guid
    });
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.main} unselectable`} {...elementProps}>
        <div className={styles.emoji}>{emoji}</div>
        <div className={styles.name}>{name}</div>
      </div>
      <div className={styles.preview} onClick={triggerPreview}>Preview</div>
    </div>
  );
}
