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
import { findDifference } from "../../utils/FindDifference";

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
  const [playerColor, setPlayerColor] = useState<string>("red");
  const [playerNumber, setPlayerNumber] = useState<number>(0);
  const [moveMutation, moveMutationRes] = useMovePieceMutation();
  const [sidePanelUIMsg, setSidePanelUIMsg] = useState<string>("loading...");
  const meInfo = useMeQuery();

  const socket = io("http://localhost:4000/");

  if (meInfo.data?.me) {
    socket.emit("joinRoom", { nickname: meInfo.data.me.nickname, roomId: gameId });
  }

  socket.on("moveCompleted", async () => {
    console.log("recieved move completion");
    const previousBoard = board;
    const a = await gameInfo.refetch({
      gameId: String(gameId),
    });
  });

  const makePlayerMove = async () => {
    console.log(board)
    try {
      const res = await moveMutation({ variables: { gameBoard: board, gameId } })
      socket.emit("completedMove");
    } catch (err) {
      console.log(err);
      
    }
  };

  //TODO: MOVE hoverButtons TO OWN COMPONENET
  const hoverButtons = () => {
    let jsxArr = [];
    for (let i = 0; i < 7; i++) {
      jsxArr.push(
        <>
          <button
            className={styles.hoverButton}
            style={{ gridColumn: i + 1, gridRow: 1, zIndex: 10 }}
            key={`buttonNo.${i + 1}`}
            onMouseEnter={() => {
              handleEnterAndLeave(i, true);
            }}
            onMouseLeave={() => {
              handleEnterAndLeave(i, false);
            }}
            onClick={async () => {
              if (!isUserMove) return;
              updateFallingArr(i, playerColor, playerNumber, false);
              handleFallenPieces(board)
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
        if (board[i][j] === 1) {
          newArr.push(
            <img
              src={`../../../static/red-piece.svg`}
              alt={`red_piece.svg`}
              onClick={() => {}}
              style={{
                gridColumn: j + 1,
                gridRow: i + 1,
              }}
              key={`${i}${j}redFallen`}
              className={styles.fallenPiece}
            />
          );
        }
        if (board[i][j] === 2) {
          newArr.push(
            <img
              src={`../../../static/yellow-piece.svg`}
              alt={`yellow_piece.svg`}
              onClick={() => {}}
              style={{
                gridColumn: j + 1,
                gridRow: i + 1,
              }}
              key={`${i}${j}yellowFallen`}
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
              className={calculateCSSClass(i, color)}
            />
          );
        } else {
          return;
        }
      });

      return [...addOn, ...fallingPieceArr];
    });
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

  const calculateCSSClass = (column: number, color: string) => {
    if (!userTurn) {
      return "error";
    }

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
        return color === 'red' ? 1 : 2;
      } else {
        return item;
      }
    });
    const newArr = board;

    newArr[row] = newRow;

    setBoard(newArr);

    return findStyle(row);
  };

  const findStyle = (row: number) => {
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
  };

  const updateFallingArr = async (i: number, colorStr: string, playerColor: number ,recieved: boolean) => {
    const newFArr = fallingArr;
    newFArr[i] = playerNumber;
    setFallingArr(newFArr);
    handlePieceFallingArr(colorStr);
    await sleep(700);
    if (!recieved){
      await makePlayerMove();
    }
    setFallingArr([0, 0, 0, 0, 0, 0, 0]);
    setHoverArr([0, 0, 0, 0, 0, 0, 0]);
    setFallingPieceArr([<></>]);
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

    if (!doArrsMatch(resGameData.gameBoard, board)) {
      const oldBoard = board;

      const newBoard = resGameData.gameBoard.map((item) => {
        return item;
      });
      const difference = findDifference(newBoard, oldBoard);

      updateFallingArr(difference[1], playerColor === "red" ? "yellow" : "red", playerNumber === 1 ? 2 : 1, true)
      setBoard(newBoard);
      handleFallenPieces(newBoard)
    }

    if (resGameData.user2?.nickname !== opponentName && resGameData.user2) {
      setOpponentName(resGameData.user2.nickname);
    }

    if (resGameData.whoseMove === resMeData._id) {
      setIsUserMove(true);
    } else {
      setIsUserMove(false);
    }
    if (resGameData.gameBoard) {
    }

    if (resMeData._id === resGameData.user1._id) {
      setPlayerColor("red");
      setPlayerNumber(1);
    } else {
      setPlayerColor("yellow");
      setPlayerNumber(2);
    }
  }, [gameInfo.data]);

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
                <button onClick={() => console.log(board)}>dddddddddddddd</button>

                <img src='../../../static/board.svg' alt='msgSendIco' className={styles.gameBoard} />
                <div className={styles.pieceArrGrid}>
                  {hoverButtons()} {fallenPieces}
                </div>
              </div>
            </div>
            <SidePanelUI board={board} gameInfo={gameInfo} meInfo={meInfo} isUserMove={isUserMove} gameId={gameId} />
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
