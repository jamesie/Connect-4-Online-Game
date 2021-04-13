import { LazyQueryResult } from "@apollo/client";
import React, { useState, useEffect } from "react";
import styles from "../pages/game/gamePage.module.css";
import { MeQueryResult, FetchGameInfosLazyQueryHookResult, FetchGameInfosQuery, Exact } from "../types";
import NextLink from "next/link";

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
            <div className={styles.whosTurnFont}>No one has joined your game!</div>
            <div className={styles.whosTurnFont}>Send a friend this link:</div>
            <div className={styles.whosTurnFont}>www.connect4online.xyz/join/</div>
            <div className={styles.whosTurnFont}>{gameId}</div>
          </div>
          <CircularProgress color='primary' />
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
          <div className={styles.textChatButton}>
            <img src='../../../static/message-send.svg' alt='msgSendIco' className={styles.sendImg} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidePanelUI;
