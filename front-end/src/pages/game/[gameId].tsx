import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import styles from "./gamePage.module.css";
import { io, Socket } from "socket.io-client";
import stylesI from "../index.module.css";
import { Button } from "@material-ui/core";

const gamePage: NextPage<{ gameId: string }> = ({ gameId }) => {
  const [urMove, setUrMove] = useState<boolean>();
  const [hoverArr, setHoverArr] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [pieces, setPieces] = useState(<></>);

  const socket = io("http://localhost:4000/");

  socket.emit("joinRoom", { nickname: "HARDCODEDNICKNAME", roomId: gameId });

  socket.on("moveCompleted", () => {
    setUrMove(false);
  });

  //TODO: MOVE hoverButtons TO OWN COMPONENET
  const hoverButtons = () => {
    let jsxArr = [];
    for (let i = 0; i < 7; i++) {
      jsxArr.push(
        <>
          <button
            className={styles.hoverButton}
            style={{ gridColumn: i + 1, zIndex: 10 }}
            key={`buttonNo.${i + 1}`}
            onMouseEnter={() => {
              handleEnterAndLeave(i, true);
            }}
            onMouseLeave={() => {
              handleEnterAndLeave(i, false);
            }}
          />
        </>
      );
    }
    return jsxArr;
  };

  const handleEnterAndLeave = (i: number, enter: boolean) => {
    setHoverArr(
      hoverArr.map((item, index) => {
        if (index === i) {
          return enter ? 1 : 0;
        } else {
          return enter ? 0 : item;
        }
      })
    );
  };

  //TODO: MOVE hoverButtons TO OWN COMPONENET

  //TODO: MOVE pieces TO OWN COMPONENET

  useEffect(() => {
    setPieces(() => {
      for (let i = 0; i < hoverArr.length; i++) {
        if (hoverArr[i] == 1) {
          return (
            <img
              src={`../../../static/${playerColor}-piece.svg`}
              alt={`${playerColor}_piece.svg`}
              onClick={() => {}}
              style={{
                gridColumn: i + 1,
              }}
              key={i + "img"}
            />
          );
        }
      }
    });
  }, [hoverArr]);

  //TODO: MOVE pieces TO OWN COMPONENET

  const playerColor = "red";

  return (
    <div className={stylesI.gradientBG}>
      <div className={styles.wholeCenterWrapper}>
        <div className={styles.boardGrid}>
          <div style={{ gridColumn: 3 }} className={styles.boardUIWrapper}>
            <div className={styles.piecesBoardSeperator}>
              <div className={styles.piecesHolder}>{pieces}</div>
              <img src='../../../static/board.svg' alt='msgSendIco' className={styles.gameBoard} />
              <div className={styles.pieceArrGrid}>{hoverButtons()}</div>
            </div>
          </div>
          <div style={{ gridColumn: 5, display: "grid" }} className={styles.sideUIWrapper}>
            <div style={{ gridRow: 1 }} className={styles.playerUIWrapper}>
              <div>{String(hoverArr)}</div>
              <div style={{ gridRow: 2 }} className={styles.textChatWrapper}>
                <div className={styles.sendWrapper}>
                  <input className={styles.textChatArea} />
                  <div className={styles.textChatButton}>
                    <img src='../../../static/message-send.svg' alt='msgSendIco' className={styles.sendImg} />
                  </div>
                </div>
              </div>
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
