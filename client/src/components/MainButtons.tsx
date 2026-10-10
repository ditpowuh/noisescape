import styles from "./MainButtons.module.css";
import {useState} from "react";
import {useShallow} from "zustand/react/shallow";

import {motion, AnimatePresence} from "motion/react";

import {Menu as ContextMenu, Item as ContextItem, useContextMenu} from "react-contexify";

import {useSoundboardStore} from "@/stores/SoundboardStore";

import PlusIcon from "@/assets/Plus.svg?react";
import StopIcon from "@/assets/Stop.svg?react";

import external from "@/lib/external";

interface MainButtonsProps {
  theme: "dark" | "light";
}

export default function MainButtons({theme}: MainButtonsProps) {
  const {show: showStopMenu} = useContextMenu({
    id: "StopSoundButton"
  });

  const {show: showAddSoundMenu} = useContextMenu({
    id: "AddSoundButton"
  });

  const [setActivePanel] = useSoundboardStore(useShallow((state) => [state.setActivePanel]));
  const [hoveringLeftButton, setHoveringLeftButton] = useState<boolean>(false);
  const [hoveringRightButton, setHoveringRightButton] = useState<boolean>(false);

  const handleStopContextMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    showStopMenu({event});
  }

  const handleAddSoundContextMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    showAddSoundMenu({event});
  }

  const openAddSoundPanel = () => {
    external.sendCommand({
      name: "StopPreview"
    });
    setActivePanel("AddSound");
  }

  const stopSounds = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.detail === 1) {
      external.sendCommand({
        name: "StopAllSounds"
      });
    }
    if (event.detail === 2) {
      external.sendCommand({
        name: "StopPreview"
      });
    }
  }

  return (
    <>
      <div className={styles.bar}>
        <div className={styles.left}>
          <button className={styles.button} onMouseEnter={() => setHoveringLeftButton(true)} onMouseLeave={() => setHoveringLeftButton(false)} onClick={openAddSoundPanel} onContextMenu={handleAddSoundContextMenu}>
            <PlusIcon/>
          </button>
          <AnimatePresence mode="wait">
            {hoveringLeftButton && (
              <motion.div className={styles.note} initial={{opacity: 0, y: "100%"}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: "100%"}}>
                <div>Single click - Add sound</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className={styles.right}>
          <button className={styles.button} onMouseEnter={() => setHoveringRightButton(true)} onMouseLeave={() => setHoveringRightButton(false)} onClick={stopSounds} onContextMenu={handleStopContextMenu}>
            <StopIcon/>
          </button>
          <AnimatePresence mode="wait">
            {hoveringRightButton && (
              <motion.div className={styles.note} initial={{opacity: 0, y: "100%"}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: "100%"}}>
                <div>Stop all sounds - Single click</div>
                <div>Stop all sounds and preview - Double click</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <ContextMenu className={styles.contextmenu} id="StopSoundButton" animation={false} theme={theme}>
        <ContextItem id="SetHotkey" onClick={() => setActivePanel("StopSoundHotkey")}>
          Set hotkey
        </ContextItem>
      </ContextMenu>
      <ContextMenu className={styles.contextmenu} id="AddSoundButton" animation={false} theme={theme}>
        <ContextItem id="AddSound" onClick={openAddSoundPanel}>
          Add sound
        </ContextItem>
      </ContextMenu>
    </>
  );
}
