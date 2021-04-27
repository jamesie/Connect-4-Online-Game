import { ApolloError, LazyQueryResult } from "@apollo/client";
import React, { useState, useEffect } from "react";
import styles from "../pages/game/gamePage.module.css";
import {
  MeQueryResult,
  FetchGameInfosQuery,
  Exact,
  useGameSubscriptionSubscription,
  GameSubscriptionSubscription,
  useMessagesSubscriptionSubscription,
} from "../types";
import { Textfit } from "react-textfit";
import { CircularProgress, createMuiTheme } from "@material-ui/core";
import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io-client/build/typed-events";
import { gameRes } from "../pages/game/[gameId]";
import { useSendMessageMutation } from '../types';

interface SidePanelUIProps {
  board: number[][];
  gameInfo: gameRes;
  meInfo: MeQueryResult;
  isUserMove: boolean;
  gameId: string;
}

const SidePanelUI: React.FC<SidePanelUIProps> = ({ board, gameInfo, meInfo, isUserMove, gameId }) => {
  const [whosMoveJSX, setWhosMoveJSX] = useState<JSX.Element>(
    <>
      <CircularProgress color='primary' />
    </>
  );

  const [msgInput, setMsgInput] = useState<string>("");

  const messagesSubRes = useMessagesSubscriptionSubscription({
    skip: !gameInfo?.messagesId,
    variables: {
      messagesId: gameInfo?.messagesId,
    },
  });

  const [callSendMessageMutation] = useSendMessageMutation()

  const handleSendingMsg = (msg: string) => {
    const id = gameInfo?._id;
    if (!id) return;
    if (msg.length === 0) return;
    //send message
    callSendMessageMutation({variables: {
      messagesId: gameInfo?.messagesId,
      message: msg
    }})
    setMsgInput("");
  };

  useEffect(() => {
    if (!gameInfo?.user2) {
      setWhosMoveJSX(
        <>
          <div>
            <text className={styles.whosTurnFont}>No one has joined your game!</text>
            <text className={styles.whosTurnFont}>Send a friend this link:</text>
            <text className={styles.whosTurnFont}>www.connect4online.xyz/join/</text>
            <text className={styles.whosTurnFont}>{gameId}</text>
          </div>
          <CircularProgress color='primary' />
        </>
      );
    } else if (gameInfo?.whoWon) {
      setWhosMoveJSX(
        <>
          <div className={styles.textWrapper}>
            <Textfit mode='multi' className={styles.whosTurnFont} style={{ height: "150px", width: "250px" }}>
              {gameInfo?.whoWon === meInfo?.data?.me?._id
                ? ` You Won! Congratulations!`
                : ` Opponent ${
                    gameInfo?.user1._id === meInfo?.data?.me?._id
                      ? gameInfo?.user2.nickname.toUpperCase()
                      : gameInfo?.user1.nickname.toUpperCase()
                  } won! Unlucky!`}
            </Textfit>
          </div>
        </>
      );
    } else {
      setWhosMoveJSX(
        <>
          <div className={styles.textWrapper}>
            <Textfit mode='multi' className={styles.whosTurnFont} style={{ height: "150px", width: "250px" }}>
              {gameInfo?.whoseMove === meInfo?.data?.me?._id
                ? ` It's Your Turn!`
                : ` It's ${
                    gameInfo?.user1._id === meInfo?.data?.me?._id
                      ? gameInfo?.user2.nickname.toUpperCase()
                      : gameInfo?.user1.nickname.toUpperCase()
                  }'s Turn!`}
            </Textfit>
          </div>
        </>
      );
    }
  }, [gameInfo, meInfo]);

  let a = [<></>];

  return (
    <div style={{ gridColumn: 5, display: "grid" }} className={styles.sideUIWrapper}>
      <div style={{ gridRow: 1, display: "grid", placeItems: "center" }} className={styles.playerUIWrapper}>
        {whosMoveJSX}
      </div>

      <div style={{ gridRow: 2 }} className={styles.textChatWrapper}>
        <div className={styles.msgsArea}>
          {messagesSubRes?.data?.messagesSubscription?.messages.map((i, j) => {
            return (
              <>
                <div className={styles.msgBackground} key={`messageNo.${j}`}>
                  <Textfit className={styles.msgUsername} style={{ height: "80%", width: "80%" }}>
                    {i[0]}
                  </Textfit>
                  <p className={styles.msgParagraph}>{i[1]}</p>
                </div>
              </>
            );
          })}
        </div>
        <div className={styles.sendWrapper}>
          <input className={styles.textChatArea} value={msgInput} onChange={(e) => setMsgInput(e.target.value)} />
          <button
            className={styles.textChatButton}
            onClick={() => {
              handleSendingMsg(msgInput);
            }}
          >
            <img src='../../../static/message-send.svg' alt='msgSendIco' className={styles.sendImg} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidePanelUI;
