import { LazyQueryResult } from "@apollo/client";
import React, { useState, useEffect } from "react";
import styles from "../pages/game/gamePage.module.css";
import { MeQueryResult, FetchGameInfosLazyQueryHookResult, FetchGameInfosQuery, Exact } from "../types";
import NextLink from "next/link";
import { Textfit } from 'react-textfit';


import { CircularProgress, createMuiTheme } from "@material-ui/core";

interface SidePanelUIProps {
  board: number[][];
  gameInfo: LazyQueryResult<FetchGameInfosQuery, Exact<{ gameId: string }>> | null;
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
    } else {
      setWhosMoveJSX(
        <>
          <div className={styles.textWrapper}>

            <Textfit mode="multi" className={styles.whosTurnFont} style={{height: '150px', width: "250px"}}>
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
        <div className={styles.sendWrapper}>
          <input className={styles.textChatArea} />
          <button className={styles.textChatButton}>
            <img src='../../../static/message-send.svg' alt='msgSendIco' className={styles.sendImg} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SidePanelUI;
