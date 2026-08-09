import styles from "./DeviceSelector.module.css";
import {useEffect, useRef} from "react";

import external from "@/lib/external";

interface DeviceSelectorProps {
  inputDevices: string[];
  outputDevices: string[];
}

export default function DeviceSelector({inputDevices, outputDevices}: DeviceSelectorProps) {
  const inputSelectRef = useRef<HTMLSelectElement>(null);
  const outputSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    external.receiveCommand((message) => {
      switch (message.name) {
        case "InitialLoad": {
          if (inputSelectRef.current !== null) {
            inputSelectRef.current.value = message.inputDevices[message.inputIndex];
          }
          if (outputSelectRef.current !== null) {
            outputSelectRef.current.value = message.outputDevices[message.outputIndex];
          }
          break;
        }
      }
    });
  }, []);

  const selectInputDevice = (event: React.ChangeEvent<HTMLSelectElement>) => {
    external.sendCommand({
      name: "SelectInputDevice",
      device: event.target.value
    });
  }

  const selectOutputDevice = (event: React.ChangeEvent<HTMLSelectElement>) => {
    external.sendCommand({
      name: "SelectOutputDevice",
      device: event.target.value
    });
  }

  return (
    <div className={styles.section}>
      <div>
        <div>Select your input microphone:</div>
        <select ref={inputSelectRef} className={styles.selector} onChange={selectInputDevice}>
          {
            inputDevices.map((inputDevice, index) => (
              <option key={`${inputDevice}~${index}`}>{inputDevice}</option>
            ))
          }
        </select>
      </div>
      <div>
        <div>Select your virtual cable:</div>
        <select ref={outputSelectRef} className={styles.selector} onChange={selectOutputDevice}>
          {
            outputDevices.map((outputDevice, index) => (
              <option key={`${outputDevice}~${index}`}>{outputDevice}</option>
            ))
          }
        </select>
      </div>
    </div>
  );
}
