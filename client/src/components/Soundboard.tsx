import styles from "./Soundboard.module.css";
import {useState, useEffect, useMemo} from "react";
import {useShallow} from "zustand/react/shallow";

import {useSoundboardStore} from "@/stores/SoundboardStore";

import {Menu as ContextMenu, Item as ContextItem, useContextMenu, type ItemParams} from "react-contexify";

import SoundTrigger from "@/components/SoundTrigger";

import external from "@/lib/external";

import type {Sound} from "@/types/sound";

interface SoundboardProps {
  theme: "dark" | "light";
}

export default function Soundboard({theme}: SoundboardProps) {
  const {show} = useContextMenu({
    id: "Soundboard"
  });

  const [contextSound, setContextSound] = useState<Sound | null>(null);

  const [sounds, setSounds, addSound, updateSound] = useSoundboardStore(useShallow((state) => [state.sounds, state.setSounds, state.addSound, state.updateSound]));
  const [setCurrentlyEditingSound] = useSoundboardStore(useShallow((state) => [state.setCurrentlyEditingSound]));
  const [setActivePanel] = useSoundboardStore(useShallow((state) => [state.setActivePanel]));

  const sortedSounds = useMemo(() => {
    return [...sounds].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [sounds]);

  const handleContextMenu = (event: React.MouseEvent, sound: Sound, index: number) => {
    event.preventDefault();

    setContextSound(sound);

    show({
      event: event,
      props: {
        sound,
        index
      }
    });
  }

  const handleContextMenuItemClick = ({id, props}: ItemParams<{sound: Sound, index: number}>) => {
    if (!props) {
      return;
    }

    switch (id) {
      case "Pin": {
        external.sendCommand({
          name: "TogglePin",
          id: props.sound.id
        });
        updateSound({...props.sound, pinned: !props.sound.pinned}, props.sound.id);
        break;
      }
      case "Edit": {
        setCurrentlyEditingSound({
          sound: props.sound,
          index: props.index
        });
        external.sendCommand({
          name: "StopPreview"
        });
        setActivePanel("EditSound");
        break;
      }
      case "Location": {
        external.sendCommand({
          name: "ShowSoundAsFile",
          id: props.sound.id
        });
        break;
      }
    }
  }

  useEffect(() => {
    external.receiveCommand((message) => {
      switch (message.name) {
        case "InitialLoad": {
          setSounds(message.sounds);
          break;
        }
        case "AddSound": {
          addSound({
            id: message.soundGuid,
            name: message.soundName,
            emoji: message.soundEmoji,
            pinned: message.soundPinned,
            volume: message.soundVolume
          });
          break;
        }
      }
    });
  }, []);

  return (
    <>
      <div className={styles.soundboard}>
        {
          sortedSounds.map((sound, index) => (
            <SoundTrigger key={`${sound.id}~${index}`} name={sound.name} emoji={sound.emoji} pinned={sound.pinned} guid={sound.id} onContextMenu={(event) => handleContextMenu(event, sound, index)}/>
          ))
        }
      </div>
      <ContextMenu className={styles.contextmenu} id="Soundboard" animation={false} theme={theme}>
        <ContextItem id="Pin" onClick={handleContextMenuItemClick}>
          {contextSound?.pinned ? "Unpin Sound" : "Pin Sound"}
        </ContextItem>
        <ContextItem id="Edit" onClick={handleContextMenuItemClick}>
          Edit Sound
        </ContextItem>
        <ContextItem id="Location" onClick={handleContextMenuItemClick}>
          Show Location of Sound
        </ContextItem>
      </ContextMenu>
    </>
  );
}
