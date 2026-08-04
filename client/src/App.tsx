import styles from "./App.module.css";
import {useState, useEffect} from "react";

import "./global.css";

import Wave from "react-wavify";

import AddSoundPanel from "@/components/AddSoundPanel";
import MainButtons from "@/components/MainButtons";
import DeviceSelector from "@/components/DeviceSelector";
import Sound from "@/components/Sound";

import external from "@/lib/external";

export default function App() {
  const theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  const [inputDevices, setInputDevices] = useState<string[]>([]);
  const [outputDevices, setOutputDevices] = useState<string[]>([]);

  // TEMP: Just to test
  const trigger = () => {
    external.sendCommand({
      name: "TriggerSelect",
      message: "test"
    });
  }

  // TEMP: Just to test
  const trigger2 = () => {
    external.sendCommand({
      name: "StopPreview",
      message: "test"
    });
  }

  useEffect(() => {
    external.receiveCommand((message) => {
      switch (message.name) {
        case "InitialLoad": {
          setInputDevices(message.inputDevices);
          setOutputDevices(message.outputDevices);
          break;
        }
        default: {
          break;
        }
      }
    });

    external.sendCommand({
      name: "InitialLoad"
    });
  }, []);

  return (
    <>
      <div className={styles.content}>
        <div className={styles.wave}>
          <Wave fill={theme === "dark" ? "#222222" : "#ffffff"} paused={false} options={{height: 50, amplitude: 25, speed: 0.125, points: 3}}/>
        </div>
        <DeviceSelector inputDevices={inputDevices} outputDevices={outputDevices}/>
        <Sound name="sound1" emoji="❤️"/>
        <div onClick={trigger}>TEST</div>
        <div onClick={trigger2}>TEST2</div>
      </div>
      <MainButtons/>
      <AddSoundPanel/>
    </>
  );
}
