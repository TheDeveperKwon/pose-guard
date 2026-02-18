"use client";

import { useEffect, useState } from "react";
import styles from "./ScrollDownCue.module.css";

type Props = {
  targetId: string;
  ariaLabel: string;
};

export function ScrollDownCue({ targetId, ariaLabel }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY || window.pageYOffset;
      const firstSectionLimit = window.innerHeight * 0.92;
      setVisible(y > 24 && y < firstSectionLimit);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const handleClick = () => {
    const target = document.getElementById(targetId);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <button
      type="button"
      className={`${styles.root}${visible ? ` ${styles.visible}` : ""}`}
      onClick={handleClick}
      aria-label={ariaLabel}
    >
      <span className={styles.mark} aria-hidden />
    </button>
  );
}
