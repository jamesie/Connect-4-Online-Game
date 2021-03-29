import { Grid, Paper } from "@material-ui/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import styles from "./gamePage.module.css";
import { useIsHover } from "./useIsHover";

const gamePage: NextPage<{ pageId: string }> = () => {
  //'../../../static/board.svg'

  const [hover, handleHover] = useState({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  });

  const buttons = () => {
    let arr = [];

    for (let i = 0; i < 7; i++) {
      var classname = "b" + i;
      arr.push(
        <Grid item xs>
          <button
            onClick={() => {
              console.log(hover);
            }}
            onMouseEnter={(e) => {
              for (let i = 0; i < 7; i++) {
                if (hover[i] === true && hover[i] !== parseInt(e.target.name)) {
                  handleHover({
                    ...hover,
                    [i]: false,
                    [parseInt(e.target.name)]: true,
                  });
                  console.log("returning")
                  return;
                }
              }
              handleHover({
                ...hover,
                [parseInt(e.target.name)]: true,
              });
            }}
            className={styles.classname}
            name={String(i)}
            onMouseLeave={(e) => {
              handleHover({
                ...hover,
                [parseInt(e.target.name)]: false,
              });
            }}
          >
            ddddd
          </button>
        </Grid>
      );
    }
    return arr;
  };

  const whereHover = (): string | null => {
    for (let index = 0; index < 7; index++) {
      if (hover[index] === true) {
        return `HOVERING OVER ${index}`;
      }
    }
    return null;
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
      <h1 className={styles.whosturn}>{whereHover()}</h1>

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
