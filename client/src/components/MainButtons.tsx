import styles from "./MainButtons.module.css";

import PlusIcon from "@/assets/Plus.svg?react";

export default function MainButtons() {
  return (
    <div className={styles.bar}>
      <button className={styles.button}><PlusIcon/></button>
    </div>
  );
}
