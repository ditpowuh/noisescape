import styles from "./PassthroughToggle.module.css";
import {useState, useEffect} from "react";

import {AnimatePresence, motion} from "motion/react";

import MicrophoneOnIcon from "@/assets/MicrophoneOn.svg?react";
import MicrophoneOffIcon from "@/assets/MicrophoneOff.svg?react";

import external from "@/lib/external";

export default function PassthroughToggle() {
  const [passthrough, setPassthrough] = useState<boolean>(false);

  const toggle = () => {
    external.sendCommand({
      name: "TogglePassthrough"
    });
    setPassthrough((state) => !state);
  }

  useEffect(() => {
    external.receiveCommand((message) => {
      switch (message.name) {
        case "InitialLoad": {
          setPassthrough(message.passthrough);
          break;
        }
      }
    });
  }, []);

  return (
    <div>
      <div className={styles.text}>Send microphone input to virtual cable</div>
      <button className={styles.button} title={passthrough ? "Enabled" : "Disabled"} onClick={toggle} style={{color: passthrough ? "#00de00" : "#de0000"}}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={passthrough ? "on" : "off"} initial={{opacity: 0, scale: 0}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0}} transition={{duration: 0.25}}>
            {passthrough ? <MicrophoneOnIcon/> : <MicrophoneOffIcon/>}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
