import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import JoinPageMessage from "../../components/JoinPageMessage";
import styles from "../index.module.css";
import { withApollo } from "../../utils/withApollo";
import Head from "next/head";
import { useFetchGameInfosQuery } from '../../types';

const joinPage: NextPage<{ joinGameId: string }> = ({ joinGameId }) => {
  const router = useRouter();
  const gameInfo = useFetchGameInfosQuery({ variables: {
    gameId: joinGameId
  }})

  return (
    <>
      <Head>
        <meta property='og:title' content="Connect4Online | You've been invited to play Multiplayer Connect 4!" />
        <meta property='og:type' content='website' />
        <meta property='og:url' content={`http://www.connect4online.xyz/join/${joinGameId}`} />
        <meta property='og:image' content='https://i.imgur.com/aeNjMa7.png' />
        <meta
          property='og:description'
          content={`Your friend ${gameInfo?.data?.fetchGameInfos?.user1?.nickname}, has invited you to play a game of Connect 4 Online.`}
        />
        <meta name='theme-color' content='#4b7ff6' />
        <meta name='twitter:card' content='summary_large_image' />
      </Head>
      <div className={styles.gradientBG}>
        <div style={{ display: "grid", placeItems: "center", left: 0, right: 0, top: 0, bottom: 0, position: "fixed" }}>
          <div style={{ display: "grid" }}>
            <div style={{ gridRow: 1, marginBottom: "2vh" }}>
              <div className={styles.titlescreen}>Welcome To</div>
              <div className={styles.titlescreen}>ConnectFourOnline.xyz</div>
            </div>
            <div style={{ gridRow: 2, display: "grid", placeItems: "center" }} className={styles.startGameWrapper}>
              <JoinPageMessage joinGameId={joinGameId} gameInfo={gameInfo} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

joinPage.getInitialProps = ({ query }) => {
  return {
    joinGameId: query.joinGameId as string,
  };
};

export default withApollo({ ssr: true })(joinPage);
