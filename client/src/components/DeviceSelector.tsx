import styles from "./DeviceSelector.module.css";

import external from "@/lib/external";

interface DeviceSelectorProps {
  inputDevices: string[];
  outputDevices: string[];
  selectedInput: string;
  selectedOutput: string;
  setSelectedInput: (device: string) => void;
  setSelectedOutput: (device: string) => void;
}

export default function DeviceSelector({inputDevices, outputDevices, selectedInput, selectedOutput, setSelectedInput, setSelectedOutput}: DeviceSelectorProps) {
  const selectInputDevice = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedInput(event.target.value);
    external.sendCommand({
      name: "SelectInputDevice",
      device: event.target.value
    });
  }

  const selectOutputDevice = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOutput(event.target.value);
    external.sendCommand({
      name: "SelectOutputDevice",
      device: event.target.value
    });
  }

  return (
    <div className={styles.section}>
      <div>
        <div>Select your input microphone:</div>
        <select value={selectedInput} className={styles.selector} onChange={selectInputDevice}>
          {
            inputDevices.map((inputDevice, index) => (
              <option key={`${inputDevice}~${index}`}>{inputDevice}</option>
            ))
          }
        </select>
      </div>
      <div>
        <div>Select your virtual cable:</div>
        <select value={selectedOutput} className={styles.selector} onChange={selectOutputDevice}>
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
