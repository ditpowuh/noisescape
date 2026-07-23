import styles from "./App.module.css";
import {useState} from "react";

import "./global.css";

import external from "@/lib/external";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className={styles.content}>
        <div></div>
      </div>
    </>
  );
}
