import { Grid, Paper } from "@material-ui/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import styles from "./gamePage.module.css";
import { useIsHover } from "./useIsHover";

const gamePage: NextPage<{ gameId: string }> = () => {
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

  const [pieces, setPieces] = useState([<></>]);

  const buttons = (): JSX.Element[] | null => {
    let arr = [];
    for (let i = 0; i < 7; i++) {
      arr.push(
        <button
          onClick={() => {
            console.log(typeof (<></>));
          }}
          onMouseEnter={(e) => {
            for (let i = 0; i < 7; i++) {
              if (hover[i] === true && hover[i] !== parseInt(e.target.name)) {
                handleHover({
                  ...hover,
                  [i]: false,
                  [parseInt(e.target.name)]: true,
                });
                console.log("returning");
                return;
              }
            }
            handleHover({
              ...hover,
              [parseInt(e.target.name)]: true,
            });
          }}
          className={styles.button}
          name={String(i)}
          onMouseLeave={(e) => {
            handleHover({
              ...hover,
              [parseInt(e.target.name)]: false,
            });
          }}
          style={{ gridColumn: i + 1, gridRow: 1 }}
        >
          column {i}
        </button>
      );
    }
    return arr;
  };

  const whereHoverDebug = (): string | null => {
    var string = "";
    for (let index = 0; index < 7; index++) {
      if (hover[index] === true) {
        string = `HOVERING OVER COLUMN ${index}`;
      }
    }
    return string;
  };

  useEffect(() => {
    for (let index = 0; index < 7; index++) {
      console.log(index);
      piecesArr.push(
        <>
          <img
            src={`../../../static/${playerColor}-piece.svg`}
            alt={`${playerColor}_piece.svg`}
            className={styles.piece}
            style={{
              opacity: 0,
              gridRow: 1,
              gridColumn: index + 1,
              display: "flex",
            }}
          ></img>
        </>
      );
    }
    setPieces(piecesArr);
  }, []);

  useEffect(() => {
    var jsxArr = [];
    for (let index = 0; index < 7; index++) {
      jsxArr.push(
        <>
          <img
            src={`../../../static/${playerColor}-piece.svg`}
            alt={`${playerColor}_piece.svg`}
            className={styles.piece}
            style={
              hover[index] === true
                ? {
                    opacity: 100,
                    gridRow: 1,
                    gridColumn: index + 1,
                    display: "flex",
                  }
                : { opacity: 0, gridRow: 1, gridColumn: index + 1, display: "flex" }
            }
          ></img>
        </>
      );
    }
    setPieces(jsxArr);
  }, [hover]);

  var piecesArr = [];

  const playerColor = "red";

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
      <div className={styles.mainGrid}>
        <div className={styles.middleWrapper}>
          <div className={styles.boardSeperateGrid}>
            <div className={styles.imgWrapper}>
              <img src='../../../static/board.svg' alt='Error' className={styles.board} />
            </div>
          </div>
          <div className={styles.gridPos}>
            <div className={styles.boardGrid}>
              {pieces}
              {buttons()}
            </div>
          </div>
        </div>
        <div className={styles.rightPaper}>
          <h1 className={styles.whosturn}>Its Your Turn!</h1>
          <h1 className={styles.youropponent}>Your Opponent: Bobby Fisher</h1>
          <div className={styles.textChatArea}> text chat area</div>
        </div>
      </div>
      <h1 className={styles.whosturn}>{whereHoverDebug()}</h1>
    </div>
  );
};

gamePage.getInitialProps = ({ query }) => {
  return {
    gameId: query.gameId as string,
  };
};

export default gamePage;
