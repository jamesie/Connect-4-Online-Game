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
import { red } from "@material-ui/core/colors";
import { withApollo } from "../../utils/withApollo";

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
  const [fallingPiecesJSX, setFallingPiecesJSX] = useState<JSX.Element[]>([
    <></>,
  ]);
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

  const makePlayerMove = async (proposedBoard: number[][]) => {
    try {
      await moveMutation({ variables: { gameBoard: proposedBoard, gameId } });
      console.log("completed mutation");
    } catch (err) {
      await fetchGameInfosRes.refetch({
        gameId,
      });
      console.log(err);
    }
  };

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
              let depth = 72;
              for (let j = 0; j < 6; j++) {
                //finding depth/y coordinate of move
                console.log(j, i);
                if (j === 5) {
                  depth = j;
                  break;
                }
                if (board[j + 1][i] !== 0) {
                  depth = j;
                  break;
                }
              }
              if (depth === 72) return; //there mustnt be an availible move

              const newBoard = board.map((item, index) => {
                if (index === depth){
                  return item.map((item2, index2) => {
                    if (index2 === i) {
                      return playerNumber
                    } else {
                      return item2
                    }
                  });
                } else {
                  return item
                }
              });
              newBoard[depth][i] = playerNumber;
              console.log(newBoard);
              makePlayerMove(newBoard);
              setHoverArr([0, 0, 0, 0, 0, 0, 0])
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
    console.log("NEW PUBSUB UPDATE")
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

  const gameUpdater = async (gameRes: gameRes, meRes: MeQuery, skipAnimation?: boolean) => {
    if (!gameRes) {
      return;
    }
    if (!meRes) {
      return;
    }
    if (!doArrsMatch(gameRes.gameBoard, board)) {
      const oldBoard = board;

      const newBoard = gameRes.gameBoard.map((item) => {
        return item;
      });
      console.log("newBoard" , newBoard)
      console.log("oldBoard" ,oldBoard)
      const differences = findDifference(newBoard, oldBoard);
      console.log("difference", differences);
      //if (skipAnimation) {
        await handleDifference(differences);
      //}
      setBoard(newBoard);
      handleFallenPieces(newBoard);
    }

    if (gameRes.user2?.nickname !== opponentName && gameRes.user2) {
      setOpponentName(gameRes.user2.nickname);
    }

    if (gameRes.whoseMove === meRes.me._id) {
      setIsUserMove(true);
    } else {
      setIsUserMove(false);
    }

    if (gameRes.whoWon) {
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

  const handleDifference = async (differences: number[][]) => {
    //difference[0] is the row that there is a difference on
    //difference[1] is the column that there is a difference on
    //difference[2] is the color that the difference is
    const oldUserMove = isUserMove;
    setIsUserMove(false);
    setFallingPiecesJSX(
      differences.map((difference, j) => {
        return (
          <img
            src={`../../../static/${difference[2] === 1 ? "red" : "yellow"}-piece.svg`}
            alt={`${difference[2]}_piece.svg`}
            onClick={() => {}}
            style={{
              gridColumn: difference[1] + 1,
              gridRow: 1
            }}
            key={difference[1] + "falling"}
            className={findStyle(difference[0])}
          />
        );
      })
    );

    await sleep(500);

    setFallingPiecesJSX(
      [<></>]
    );
    setIsUserMove(oldUserMove);
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

  return (
    <div className={stylesI.gradientBG}>
      <div className={styles.wholeCenterWrapper}>
        <div className={styles.boardGrid}>
          <div className={styles.boardUIWrapper}>
            <div className={styles.piecesBoardSeperator}>
              <div className={styles.piecesHolder}>
                {fallingPiecesJSX}
                {hoverPieces}
              </div>
              <img src='../../../static/board.svg' alt='msgSendIco' className={styles.gameBoard} />
              <div className={styles.pieceArrGrid}>
                {hoverButtons()} {fallenPieces}
              </div>
            </div>
          </div>
          <SidePanelUI gameInfo={gameInfo} meInfo={meInfo} gameId={gameId}/>
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

export default withApollo()(gamePage);
