import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { HTMLAttributes, useEffect, useState } from "react";
import styles from "./gamePage.module.css";
import { io, Socket } from "socket.io-client";
import stylesI from "../index.module.css";
import { Button, createMuiTheme } from "@material-ui/core";
import { sleep } from "../../utils/sleep";
import {
  useFetchGameInfosLazyQuery,
  useMeQuery,
  useMovePieceMutation,
  FetchGameInfosQueryResult,
  FetchGameInfosLazyQueryHookResult,
} from "../../types";
import { doArrsMatch } from "../../utils/doArrsMatch";
import SidePanelUI from "../../components/SidePanelUI";
import { ThemeProvider } from "@material-ui/styles";
import { grey } from "@material-ui/core/colors";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: grey[50],
    },
    secondary: {
      // This is green.A700 as hex.
      main: "#11cb5f",
    },
  },
});

const gamePage: NextPage<{ gameId: string }> = ({ gameId }) => {
  const router = useRouter();
  const [isUserMove, setIsUserMove] = useState<boolean>(false);
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
  const [callGameInfo, gameInfo] = useFetchGameInfosLazyQuery({ variables: { gameId } });
  const [opponentName, setOpponentName] = useState<string>("");
  const [moveMutation, moveMutationRes] = useMovePieceMutation();
  const [sidePanelUIMsg, setSidePanelUIMsg] = useState<string>("loading...");
  const meInfo = useMeQuery();

  const socket = io("http://localhost:4000/");

  socket.emit("joinRoom", { nickname: "HARDCODEDNICKNAME", roomId: gameId });

  socket.on("moveCompleted", () => {
    setIsUserMove(false);
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
              if (!isUserMove) return;
              const newFArr = fallingArr;
              newFArr[i] = 1;
              setFallingArr(newFArr);
              handlePieceFallingArr(playerColor);
              await sleep(700);
              setFallingArr([0, 0, 0, 0, 0, 0, 0]);
              setHoverArr([0, 0, 0, 0, 0, 0, 0]);
              setFallingPieceArr([<></>]);
              handleFallenPieces(board);

              //TODO: SEND GAMEBOARD QUERY HERE
            }}
          />
        </>
      );
    }
    return jsxArr;
  };

  const handleFallenPieces = (board: number[][]) => {
    const newArr = [];
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 7; j++) {
        console.log("im working hard!");
        console.log(board);
        if (board[i][j] === 1) {
          console.log(i, j);
          newArr.push(
            <img
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
          console.log(i, j);
          newArr.push(
            <img
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
    setFallenPieces(newArr);
  };

  //TODO: Reset state on move because of the placed/ 2 value
  const handleEnterAndLeave = (i: number, enter: boolean) => {
    if (!isUserMove) return;
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
    if (!userTurn) {
      return "error";
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

    move();

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

  const move = async () => {
    try {
      const res = await moveMutation({ variables: { gameBoard: board, gameId } });
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  //TODO: MOVE pieces TO OWN COMPONENET

  useEffect(() => {
    //Initializes the current game state on page load
    callGameInfo({
      variables: {
        gameId: String(gameId),
      },
    });
  }, []);

  useEffect(() => {
    if (!gameInfo.data?.fetchGameInfos) {
      console.log(gameInfo);
      if (!gameInfo.loading && gameInfo.called) {
        //If we cant find a game for this ID we've assumed theyve incorrectly typed in the game id so we can send them back to homepage
        //we could possibly make this display a game not found error
        router.push("/");
      }
      return;
    }
    if (!meInfo.data) {
      return;
    }
    const resGameData = gameInfo.data.fetchGameInfos;
    const resMeData = meInfo.data.me;

    console.log("hi");
    if (!doArrsMatch(resGameData.gameBoard, board)) {
      const newBoard = resGameData.gameBoard.map((item) => {
        return item;
      });
      setBoard(newBoard);
      handleFallenPieces(newBoard);
    }

    if (resGameData.user2?.nickname !== opponentName && resGameData.user2) {
      setOpponentName(resGameData.user2.nickname);
    }

    if (resGameData.whoseMove === resMeData._id) {
      setIsUserMove(true);
    } else {
      setIsUserMove(false);
    }

    if (resMeData._id === resGameData.user1._id) {
      playerColor = "red";
    } else {
      playerColor = "yellow";
    }
  }, [gameInfo.data]);

  let playerColor = "red";
  const playerNumber = 1;

  return (
    <ThemeProvider theme={theme}>
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
                <div className={styles.pieceArrGrid}>
                  {hoverButtons()} {fallenPieces}
                </div>
              </div>
            </div>
            <SidePanelUI board={board} gameInfo={gameInfo} meInfo={meInfo} isUserMove={isUserMove} gameId={gameId}/>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

gamePage.getInitialProps = ({ query }) => {
  return {
    gameId: query.gameId as string,
  };
};

export default gamePage;
