import { LazyQueryResult } from "@apollo/client";
import React, { useState, useEffect } from "react";
import styles from "../pages/game/gamePage.module.css";
import { MeQueryResult, FetchGameInfosQuery, Exact } from "../types";
import { Textfit } from "react-textfit";
import { CircularProgress, createMuiTheme } from "@material-ui/core";
import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io-client/build/typed-events";

type msgType = {
  username: string;
  message: string;
};

interface SidePanelUIProps {
  board: number[][];
  gameInfo: LazyQueryResult<FetchGameInfosQuery, Exact<{ gameId: string }>> | null;
  meInfo: MeQueryResult;
  isUserMove: boolean;
  gameId: string;
  socket: Socket<DefaultEventsMap, DefaultEventsMap>;
  msgsJsx: JSX.Element[]
}

const SidePanelUI: React.FC<SidePanelUIProps> = ({ board, gameInfo, meInfo, isUserMove, gameId, socket, msgsJsx }) => {
  const [whosMoveJSX, setWhosMoveJSX] = useState<JSX.Element>(
    <>
      <CircularProgress color='primary' />
    </>
  );

  const [msgInput, setMsgInput] = useState<string>("");

  const handleSendingMsg = (msg: msgType) => {
    const id = gameInfo?.data?.fetchGameInfos?._id;
    if (!id) return;
    if (msg.message.length === 0) return;
    socket.emit("sendChatMsg", { roomId: id, id: msg.username, msg: msg.message });
    setMsgInput("");
  };

  useEffect(() => {
    if (!gameInfo?.data?.fetchGameInfos?.user2) {
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
    } else if (gameInfo?.data?.fetchGameInfos?.whoWon) {
      setWhosMoveJSX(
        <>
          <div className={styles.textWrapper}>
            <Textfit mode='multi' className={styles.whosTurnFont} style={{ height: "150px", width: "250px" }}>
              {gameInfo?.data?.fetchGameInfos?.whoWon === meInfo?.data?.me?._id
                ? ` You Won! Congratulations!`
                : ` Opponent ${
                    gameInfo?.data?.fetchGameInfos?.user1._id === meInfo?.data?.me?._id
                      ? gameInfo?.data?.fetchGameInfos?.user2.nickname.toUpperCase()
                      : gameInfo?.data?.fetchGameInfos?.user1.nickname.toUpperCase()
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
              {gameInfo?.data?.fetchGameInfos?.whoseMove === meInfo?.data?.me?._id
                ? ` It's Your Turn!`
                : ` It's ${
                    gameInfo?.data?.fetchGameInfos?.user1._id === meInfo?.data?.me?._id
                      ? gameInfo?.data?.fetchGameInfos?.user2.nickname.toUpperCase()
                      : gameInfo?.data?.fetchGameInfos?.user1.nickname.toUpperCase()
                  }'s Turn!`}
            </Textfit>
          </div>
        </>
      );
    }
  }, [gameInfo, meInfo]);

  return (
    <div style={{ gridColumn: 5, display: "grid" }} className={styles.sideUIWrapper}>
      <div style={{ gridRow: 1, display: "grid", placeItems: "center" }} className={styles.playerUIWrapper}>
        {whosMoveJSX}
      </div>

      <div style={{ gridRow: 2 }} className={styles.textChatWrapper}>
        <div className={styles.msgsArea}>{msgsJsx}</div>
        <div className={styles.sendWrapper}>
          <input className={styles.textChatArea} value={msgInput} onChange={(e) => setMsgInput(e.target.value)} />
          <button
            className={styles.textChatButton}
            onClick={() => {
              handleSendingMsg({ username: meInfo?.data?.me?._id, message: msgInput });
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
