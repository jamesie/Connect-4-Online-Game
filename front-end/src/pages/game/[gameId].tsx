import { Grid, Paper } from "@material-ui/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { animated, useSpring } from "react-spring";
import PiecesAndButtons from "../../components/PiecesAndButtons";
import styles from "./gamePage.module.css";

const gamePage: NextPage<{ gameId: string }> = () => {


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
          <h1 className={styles.whosturn}>Its Your Turn!</h1>
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
