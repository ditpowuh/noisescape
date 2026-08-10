import styles from "./App.module.css";
import {useState, useEffect} from "react";
import {useShallow} from "zustand/react/shallow";
import {useMediaQuery} from "usehooks-ts";

import "react-contexify/dist/ReactContexify.css";
import "./global.css";

import {useSoundboardStore} from "@/stores/SoundboardStore";

import Wave from "react-wavify";

import AddSoundPanel from "@/components/AddSoundPanel";
import EditSoundPanel from "@/components/EditSoundPanel";
import MainButtons from "@/components/MainButtons";
import DeviceSelector from "@/components/DeviceSelector";
import PassthroughToggle from "@/components/PassthroughToggle";
import Soundboard from "@/components/Soundboard";

import external from "@/lib/external";

export default function App() {
  const darkTheme = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = darkTheme ? "dark" : "light";

  const [activePanel] = useSoundboardStore(useShallow((state) => [state.activePanel]));

  const [inputDevices, setInputDevices] = useState<string[]>([]);
  const [outputDevices, setOutputDevices] = useState<string[]>([]);

  useEffect(() => {
    external.receiveCommand((message) => {
      switch (message.name) {
        case "InitialLoad": {
          setInputDevices(message.inputDevices);
          setOutputDevices(message.outputDevices);
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
        <PassthroughToggle/>
        <Soundboard theme={theme}/>
      </div>
      <MainButtons/>
      {activePanel === "AddSound" && (
        <AddSoundPanel/>
      )}
      {activePanel === "EditSound" && (
        <EditSoundPanel/>
      )}
    </>
  );
}
