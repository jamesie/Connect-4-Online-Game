import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import styles from "./gamePage.module.css";
import { io, Socket } from "socket.io-client";
import stylesI from "../index.module.css";

const gamePage: NextPage<{ gameId: string }> = ({ gameId }) => {
  const [urMove, setUrMove] = useState<boolean>();

  const socket = io("http://localhost:4000/");

  socket.emit("joinRoom", { nickname: "HARDCODEDNICKNAME", roomId: gameId });

  socket.on("moveCompleted", () => {
    setUrMove(false);
  });

  const playerColor = "red";

  return (
    <div className={stylesI.gradientBG}>
      <div className={styles.boardGrid}>
        <div style={{ gridColumn: 4 }} className={styles.boardUIWrapper}>
          fsdfsdfsdfsfsdfsdfsdfsdfsdfsdf
        </div>
        <div style={{ gridColumn: 6, display: "grid" }} className={styles.sideUIWrapper}>
          <div style={{ gridRow: 1 }} className={styles.playerUIWrapper}>
            hhh
          </div>
          <div style={{ gridRow: 2 }} className={styles.textChatWrapper}>
            <div className={styles.sendWrapper}>
              <input className={styles.textChatArea}></input>
              <svg className={styles.textChatButton}></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

gamePage.getInitialProps = ({ query }) => {
  return {
    gameId: query.gameId as string,
  };
};

export default gamePage;
