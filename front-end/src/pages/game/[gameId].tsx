import { Grid, Paper } from "@material-ui/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import styles from "./gamePage.module.css";

const gamePage: NextPage<{ pageId: string }> = () => {
  //'../../../static/board.svg'

  const buttons = () => {
    let arr = [];

    for (let i = 0; i < 7; i++) {
      arr.push(
        <Grid item xs>
          <div
            onClick={() => {
              console.log(i);
            }}
            onMouseEnter={() => setIsShown(true)}
            onMouseLeave={() => setIsShown(false)}
          >
            ddddd
          </div>
        </Grid>
      );
    }
    return arr;
  };

  return (
    <div
      style={{
        backgroundColor: "#262626",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        position: "absolute",
      }}
    >
      <div className={styles.bottomer}>
        <Grid container direction='row' justify='center' alignItems='center'>
          <Grid item xs={2}></Grid>
          <Grid item xs={1}></Grid>
          <Grid item xs={4}>
            <img src='../../../static/board.svg' alt='Error' className={styles.board}></img>
            <div className={styles.borderer}>
              <Grid container direction='row' justify='center' alignItems='center'>
                {buttons()}
              </Grid>
            </div>
          </Grid>
          <Grid item xs={1}></Grid>
          <Grid item xs={2}>
            <div className={styles.rightPaper}>
              <h1 className={styles.whosturn}>Its Your Turn!</h1>
              <h1 className={styles.youropponent}>Your Opponent: Bobby Fisher</h1>
              <div className={styles.textChatArea}> text chat area</div>
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

gamePage.getInitialProps = ({ query }) => {
  return {
    pageId: query.pageId as string,
  };
};

export default gamePage;
