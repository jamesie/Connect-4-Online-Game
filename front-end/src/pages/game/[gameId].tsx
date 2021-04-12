import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { HTMLAttributes, useEffect, useState } from "react";
import styles from "./gamePage.module.css";
import { io, Socket } from "socket.io-client";
import stylesI from "../index.module.css";
import { Button } from "@material-ui/core";
import { sleep } from "../../utils/sleep";

const gamePage: NextPage<{ gameId: string }> = ({ gameId }) => {
  const [urMove, setUrMove] = useState<boolean>();
  const [hoverArr, setHoverArr] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [fallingArr, setFallingArr] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [fallingPieceArr, setFallingPieceArr] = useState<JSX.Element[]>([<></>]);
  const [hoverPieces, setHoverPieces] = useState<JSX.Element[]>([<></>]);
  const [fallenPieces, setFallenPieces] = useState<JSX.Element[]>([<></>]);
  const [board, setBoard] = useState<number[][]>([
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ]);
  const [userTurn, setUserTurn] = useState<boolean>(true);

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
            onClick={async () => {
              //TODO: Check if can move
              const newFArr = fallingArr;
              newFArr[i] = 1;
              setFallingArr(newFArr);
              handlePieceFallingArr("yellow");
              await sleep(700);
              setFallingArr([0, 0, 0, 0, 0, 0, 0]);
              setHoverArr([0, 0, 0, 0, 0, 0, 0]);
              setFallingPieceArr([<></>])
              handleFallenPieces();

              //TODO: SEND GAMEBOARD QUERY HERE
            }}
          />
        </>
      );
    }
    return jsxArr;
  };

  const handleFallenPieces = () => {
    const newArr = []
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 7; j++) {
        if (board[i][j] === 1){
          console.log(i, j)
          newArr.push(<img
            src={`../../../static/red-piece.svg`}
            alt={`red_piece.svg`}
            onClick={() => {}}
            style={{
              gridColumn: j + 1,
              gridRow: i + 1,
            }}
            key={i + "redfallen" + j}
            className={styles.fallenPiece}
          />
          );
        }
        if (board[i][j] === 2) {
          console.log(i, j)
          newArr.push(<img
            src={`../../../static/yellow-piece.svg`}
            alt={`yellow_piece.svg`}
            onClick={() => {}}
            style={{
              gridColumn: j + 1,
              gridRow: i + 1,
            }}
            key={i + j + "yellowfallen"}
            className={styles.fallenPiece}
          />
          );

        }
        
      }
      
    }
    setFallenPieces(newArr)
  }




  //TODO: Reset state on move because of the placed/ 2 value
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

  const handlePieceFallingArr = (color: string) => {
    setFallingPieceArr(() => {
      const addOn = fallingArr.map((item, i) => {
        if (fallingArr[i] !== 0) {
          return (
            <img
              src={`../../../static/${color}-piece.svg`}
              alt={`${color}_piece.svg`}
              onClick={() => {}}
              style={{
                gridColumn: i + 1,
                gridRow: 1,
              }}
              key={i + "falling"}
              className={calculateCSSClass(i)}
            />
          );
        } else {
          return;
        }
      });

      return [...addOn, ...fallingPieceArr];
    });
    setFallingArr([0, 0, 0, 0, 0, 0, 0]);
  };

  //TODO: MOVE pieces TO OWN COMPONENET

  useEffect(() => {
    setHoverPieces(
      hoverArr.map((item, i) => {
        if (hoverArr[i] == 1) {
          return (
            <img
              src={`../../../static/${playerColor}-piece.svg`}
              alt={`${playerColor}_piece.svg`}
              onClick={() => {}}
              style={{
                gridColumn: i + 1,
                gridRow: 1,
              }}
              key={i + "img"}
              className={styles.fallingPiece}
            />
          );
        }
      })
    );
  }, [hoverArr]);

  const calculateCSSClass = (column: number) => {
    if (!userTurn){
      return "error"
    }
    setUserTurn(false);
    let row = null;
    for (let i = 0; i < 6; i++) {
      if (board[i + 1]) {
        if (board[i + 1][column] !== 0 && board[i][column] === 0) {
          row = i;
          break;
        }
      } else {
        row = i;
        break;
      }
    }

    const newRow = board[row].map((item, index) => {
      if (index === column) {
        return playerNumber;
      } else {
        return item;
      }
    });
    const newArr = board;

    newArr[row] = newRow;

    setBoard(newArr);

    

    switch (row + 1) {
      case 1:
        return styles.pieceDown1;
      case 2:
        return styles.pieceDown2;
      case 3:
        return styles.pieceDown3;
      case 4:
        return styles.pieceDown4;
      case 5:
        return styles.pieceDown5;
      case 6:
        return styles.pieceDown6;
    }
    return "f";
  };

  //TODO: MOVE pieces TO OWN COMPONENET

  const playerColor = "red";
  const playerNumber = 1;

  return (
    <div className={stylesI.gradientBG}>
      <div className={styles.wholeCenterWrapper}>
        <div className={styles.boardGrid}>
          <div style={{ gridColumn: 3 }} className={styles.boardUIWrapper}>
            <div className={styles.piecesBoardSeperator}>
              <div className={styles.piecesHolder}>
                {fallingPieceArr}
                {hoverPieces}
              </div>

              <img src='../../../static/board.svg' alt='msgSendIco' className={styles.gameBoard} />
              <div className={styles.pieceArrGrid}>{hoverButtons()} {fallenPieces}</div>
            </div>
          </div>
          <div style={{ gridColumn: 5, display: "grid" }} className={styles.sideUIWrapper}>
            <div style={{ gridRow: 1 }} className={styles.playerUIWrapper}>
              <div>{String(hoverArr)}</div>
              <br />
              <div>{String(board[0])}</div>
              <div>{String(board[1])}</div>
              <div>{String(board[2])}</div>
              <div>{String(board[3])}</div>
              <div>{String(board[4])}</div>
              <div>{String(board[5])}</div>
              <br />
              <div>{String(userTurn)}</div>
              <button
                onClick={() => {
                  setUserTurn(userTurn ? false : true);
                }}
              >
                {" "}
                change turn{" "}
              </button>
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
