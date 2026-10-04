import styles from "./App.module.css";
import {useState, useEffect} from "react";
import {useShallow} from "zustand/react/shallow";
import {useMediaQuery} from "usehooks-ts";

import "react-contexify/dist/ReactContexify.css";
import "./global.css";

import {useSoundboardStore} from "@/stores/SoundboardStore";

import Wave from "react-wavify";

import {AnimatePresence} from "motion/react";

import TitleBar from "@/components/TitleBar";
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
  const [selectedInput, setSelectedInput] = useState<string>("");
  const [selectedOutput, setSelectedOutput] = useState<string>("");

  useEffect(() => {
    external.receiveCommand((message) => {
      switch (message.name) {
        case "InitialLoad": {
          const inputDevices = message.inputDevices as string[];
          const outputDevices = message.outputDevices as string[];

          setInputDevices(inputDevices);
          setOutputDevices(outputDevices);
          setSelectedInput(inputDevices[message.inputIndex as number] ?? "");
          setSelectedOutput(outputDevices[message.outputIndex as number] ?? "");

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
      <TitleBar/>
      <div className={styles.content}>
        <div className={styles.wave}>
          <Wave fill={theme === "dark" ? "#1a1a1a" : "#f6f6f6"} paused={false} options={{height: 0, amplitude: 25, speed: 0.125, points: 3}}/>
        </div>
        <DeviceSelector inputDevices={inputDevices} outputDevices={outputDevices} selectedInput={selectedInput} selectedOutput={selectedOutput} setSelectedInput={setSelectedInput} setSelectedOutput={setSelectedOutput}/>
        <PassthroughToggle/>
        <Soundboard theme={theme}/>
      </div>
      <MainButtons/>
      <AnimatePresence mode="wait">
        {activePanel === "AddSound" && (
          <AddSoundPanel/>
        )}
        {activePanel === "EditSound" && (
          <EditSoundPanel/>
        )}
      </AnimatePresence>
    </>
  );
}
