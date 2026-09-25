import styles from "./TitleBar.module.css";
import {useShallow} from "zustand/react/shallow";
import clsx from "clsx";

import {useSoundboardStore} from "@/stores/SoundboardStore";

import CloseIcon from "@/assets/Close.svg?react";
import ResizeIcon from "@/assets/Resize.svg?react";
import MinimiseIcon from "@/assets/Minimise.svg?react";

import external from "@/lib/external";

export default function TitleBar() {
  const [activePanel] = useSoundboardStore(useShallow((state) => [state.activePanel]));

  const closeWindow = () => {
    external.sendCommand({
      name: "CloseWindow"
    });
  }

  const resizeWindow = () => {
    external.sendCommand({
      name: "ResizeWindow"
    });
  }

  const minimiseWindow = () => {
    external.sendCommand({
      name: "MinimiseWindow"
    });
  }

  return (
    <div className={clsx(styles.titlebar, activePanel !== null && styles.shadow)}>
      <div>
        <div className={styles.name}>Noisescape</div>
      </div>
      <div className={styles.buttons}>
        <div onClick={minimiseWindow}>
          <MinimiseIcon/>
        </div>
        <div onClick={resizeWindow}>
          <ResizeIcon/>
        </div>
        <div onClick={closeWindow}>
          <CloseIcon/>
        </div>
      </div>
    </div>
  );
}
