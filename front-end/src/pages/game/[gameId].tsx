import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import SidePanelUI from "../../components/SidePanelUI";
import {
  useFetchGameInfosLazyQuery,
  useMeQuery,
  useMovePieceMutation,
  useGameSubscriptionSubscription,
  GameSubscriptionSubscription,
  MeQuery,
  FetchGameInfosQuery,
  User,
  Game,
} from "../../types";
import { doArrsMatch } from "../../utils/doArrsMatch";
import { findDifference } from "../../utils/FindDifference";
import { sleep } from "../../utils/sleep";
import stylesI from "../index.module.css";
import styles from "./gamePage.module.css";
import { Textfit } from "react-textfit";
import { useMessagesSubscriptionSubscription } from "../../types";

type msgType = {
  username: string;
  message: string;
};

export type gameRes = {
  __typename?: "Game";
} & Pick<Game, "_id" | "gameBoard" | "whoseMove" | "whoWon" | "messagesId"> & {
    user1: {
      __typename?: "User";
    } & Pick<User, "_id" | "nickname">;
    user2?: {
      __typename?: "User";
    } & Pick<User, "_id" | "nickname">;
  };

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
  const [opponentName, setOpponentName] = useState<string>("");
  const [playerColor, setPlayerColor] = useState<string>("red");
  const [playerNumber, setPlayerNumber] = useState<number>(0);
  const [fetchGameInfos, fetchGameInfosRes] = useFetchGameInfosLazyQuery({
    variables: {
      gameId,
    },
    fetchPolicy: "no-cache",
  });

  const [moveMutation, moveMutationRes] = useMovePieceMutation();
  const gameSubRes = useGameSubscriptionSubscription({
    variables: {
      gameId,
    },
  });

  const [chatMsgs, setChatMsgs] = useState<msgType[]>([]);
  const [gameInfo, setGameInfo] = useState<gameRes>();
  const meInfo = useMeQuery();

  const makePlayerMove = async () => {
    try {
      await moveMutation({ variables: { gameBoard: board, gameId } });
      console.log("completed mutation");
    } catch (err) {
      await fetchGameInfosRes.refetch({
        gameId,
      });
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
              setIsUserMove(false);
              await updateFallingArr(i, playerColor, playerNumber, false);
              handleFallenPieces(board);
              setFallingPieceArr([<></>]);
            }}
          />
        </>
      );
    }
    return jsxArr;
  };

  const handleFallenPieces = (board: number[][]) => {
    let newArr = [];
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
        return color === "red" ? 1 : 2;
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
    console.log(row + 1);
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

  const updateFallingArr = async (i: number, colorStr: string, playerColor: number, recieved: boolean) => {
    if (!recieved) {
      await makePlayerMove();
      return;
    }
    const newFArr = fallingArr;
    newFArr[i] = playerNumber;
    setFallingArr(newFArr);
    handlePieceFallingArr(colorStr);
    await sleep(700);
    setFallingPieceArr([<></>]);
    setFallingArr([0, 0, 0, 0, 0, 0, 0]);
    setHoverArr([0, 0, 0, 0, 0, 0, 0]);
  };

  //TODO: MOVE pieces TO OWN COMPONENET

  useEffect(() => {
    //Initializes the current game state on page load
    fetchGameInfos({
      variables: {
        gameId: String(gameId),
      },
    });
  }, []);

  useEffect(() => {
    if (!gameSubRes.data?.gameSubscription) {
      return;
    }
    if (!meInfo.data) {
      return;
    }
    gameUpdater(gameSubRes.data.gameSubscription, meInfo.data);
    console.log("updated with this gameSubRes data: ", gameSubRes.data.gameSubscription);
  }, [gameSubRes.data, meInfo.data]);

  useEffect(() => {
    if (!fetchGameInfosRes?.data?.fetchGameInfos) {
      return;
    }

    if (!meInfo.data) {
      if (!fetchGameInfosRes.loading || fetchGameInfosRes.error) {
        //If we cant find a game for this ID we've assumed theyve incorrectly typed in the game id so we can send them back to homepage
        //we could possibly make this display a game not found error
        // router.push("/"); //TODO:::: FIX THIS
      }
      return;
    }
    if (
      fetchGameInfosRes.data.fetchGameInfos.user1?._id !== meInfo.data.me._id &&
      fetchGameInfosRes.data.fetchGameInfos.user2?._id !== meInfo.data.me._id
    ) {
      //If we cant find a game for this ID we've assumed theyve incorrectly typed in the game id so we can send them back to homepage
      //we could possibly make this display a game not found error
      router.push("/");
    }
    gameUpdater(fetchGameInfosRes.data.fetchGameInfos, meInfo.data);
    console.log("updated with this fetchGameInfos data: ", fetchGameInfosRes.data.fetchGameInfos);
  }, [fetchGameInfosRes.data]);

  const gameUpdater = (gameRes: gameRes, meRes: MeQuery) => {
    if (!gameRes) {
      return;
    }
    if (!meRes) {
      return;
    }
    if (!doArrsMatch(gameRes.gameBoard, board)) {
      setIsUserMove(false);
      console.log("set is not move2");
      const updateBoard = async () => {
        const oldBoard = board;

        const newBoard = gameRes.gameBoard.map((item) => {
          return item;
        });
        const difference = findDifference(newBoard, oldBoard);
        console.log(difference)

        await updateFallingArr(
          difference[1],
          playerColor === "red" ? "yellow" : "red",
          playerNumber === 1 ? 2 : 1,
          true
        );
        setBoard(newBoard);
        handleFallenPieces(newBoard);
      };
      updateBoard();
    }

    if (gameRes.user2?.nickname !== opponentName && gameRes.user2) {
      setOpponentName(gameRes.user2.nickname);
    }
    console.log("whose move", gameRes.whoseMove);
    console.log("me id", meRes.me._id);
    console.log("are the same", gameRes.whoseMove === meRes.me._id);
    if (gameRes.whoseMove === meRes.me._id) {
      console.log("set is move0");
      setIsUserMove(true);
    } else {
      console.log("set is not move0");
      setIsUserMove(false);
    }

    if (gameRes.whoWon) {
      console.log("set is not move1");
      setIsUserMove(false);
    }

    if (meRes.me._id === gameRes.user1._id) {
      setPlayerColor("red");
      setPlayerNumber(1);
    } else {
      setPlayerColor("yellow");
      setPlayerNumber(2);
    }
    setGameInfo(gameRes);
  };

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
              <div className={styles.pieceArrGrid}>
                {hoverButtons()} {fallenPieces}
              </div>
            </div>
          </div>
          <SidePanelUI board={board} gameInfo={gameInfo} meInfo={meInfo} isUserMove={isUserMove} gameId={gameId} />
          <button
            onClick={() => {
              console.log(board);
            }}
          >
            debugging button
          </button>
          <button
            onClick={() => {
              console.log(gameInfo);
            }}
          >
            debugging button 2
          </button>
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
