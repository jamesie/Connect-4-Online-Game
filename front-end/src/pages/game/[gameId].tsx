import { Grid, Paper } from "@material-ui/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { animated, useSpring } from "react-spring";
import PiecesAndButtons from "../../components/PiecesAndButtons";
import styles from "./gamePage.module.css";
import { io, Socket } from 'socket.io-client';


const gamePage: NextPage<{ gameId: string }> = ({gameId}) => {

  const [urMove, setUrMove] = useState<boolean>()
  

  const socket = io("http://localhost:4000/")

  socket.emit('joinRoom', {nickname: "HARDCODEDNICKNAME", roomId: gameId})

  socket.on("moveCompleted", () => {
    setUrMove(false)
  })


  const playerColor = "red";

  return (
    <div
      style={{
        backgroundColor: "#262626",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        position: "fixed",
      }}
    >
      <div className={styles.mainGrid}>
        <div className={styles.middleWrapper}>
          <div className={styles.boardSeperateGrid}>
            <div className={styles.imgWrapper}>
              <img src='../../../static/board.svg' alt='Error' className={styles.board} />
            </div>
          </div>
          <PiecesAndButtons playerColor={playerColor} key="piecesandbuttons"/>
        </div>
        <div className={styles.rightPaper}>
          <h1 className={styles.whosturn}>{urMove ? "It's Your Turn HARDCODEDUSERNAME!" : "It's HARDCODEDOPONENTSNAME's turn"}</h1>
          <h1 className={styles.youropponent}>Your Opponent: Bobby Fisher</h1>
          <div className={styles.textChatArea}> text chat area</div>
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
