"use client";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { useEffect, useState } from "react";
import styles from "../styles/form.module.css";
import "../styles/globals.css";
import NavBar from "@/components/ui/NavBar";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      <NavBar setIsVisible={setIsVisible} setIsLogin={setIsLogin} />

      <div className={`${styles.overlayContainer} ${isVisible ? styles.showPopup : ""}`}>
        {isVisible && <div className={styles.blurBgOverlay} onClick={() => setIsVisible(false)}></div>}
        <div className={`${styles.formPopup}`}>
          {isLogin ? (
            <LoginForm setIsLogin={setIsLogin} setIsVisible={setIsVisible} />
          ) : (
            <SignupForm setIsLogin={setIsLogin} setIsVisible={setIsVisible} />
          )}
        </div>
      </div>
    </>
  );
}

