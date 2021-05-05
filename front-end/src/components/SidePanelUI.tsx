import { CircularProgress } from "@material-ui/core";
import React, { useEffect, useRef, useState } from "react";
import { Textfit } from "react-textfit";
import styles from "../pages/game/gamePage.module.css";
import { gameRes } from "../pages/game/[gameId]";
import {
  MeQueryResult, useSendMessageMutation
} from "../types";

interface SidePanelUIProps {
  gameInfo: gameRes;
  meInfo: MeQueryResult;
  gameId: string;
}

const SidePanelUI: React.FC<SidePanelUIProps> = ({ gameInfo, meInfo, gameId }) => {
  const [whosMoveJSX, setWhosMoveJSX] = useState<JSX.Element>(
    <>
      <CircularProgress color='primary' />
    </>
  );

  const [callSendMessageMutation] = useSendMessageMutation();
  const [messages, setMessages] = useState<string[][]>([]);
  const [msgInput, setMsgInput] = useState<string>("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (gameInfo?.messages)
      setMessages(gameInfo?.messages);
  }, [gameInfo?.messages]);


  useEffect(() => {
    scrollToBottom();
  }, [messages])

  const handleSendingMsg = (msg: string) => {
    const id = gameInfo?.id;
    if (!id) return;
    if (msg.length === 0) return;
    //send message
    callSendMessageMutation({
      variables: {
        gameUUID: gameInfo?.gameUUID,
        message: msg,
      },
    });
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
              {gameInfo?.whoWon === meInfo?.data?.me?.id
                ? ` You Won! Congratulations!`
                : ` Opponent ${
                    gameInfo?.user1.id === meInfo?.data?.me?.id
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
              {gameInfo?.whoseMove === meInfo?.data?.me?.id
                ? ` It's Your Turn!`
                : ` It's ${
                    gameInfo?.user1.id === meInfo?.data?.me?.id
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
    <div style={{ display: "grid" }} className={styles.sideUIWrapper}>
      <div style={{ gridRow: 1, display: "grid", placeItems: "center" }} className={styles.playerUIWrapper}>
        {whosMoveJSX}
      </div>

      <div style={{ gridRow: 2 }} className={styles.textChatWrapper}>
        <div className={styles.msgsArea}>
          {messages.map((i, j) => {
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
          <div ref={messagesEndRef} />
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
