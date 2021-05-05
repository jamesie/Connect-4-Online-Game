import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import styles from "../index.module.css";
import stylesJoin from "./joinGame.module.css";
import { withApollo } from "../../utils/withApollo";
import Head from "next/head";
import { useCreateUserMutation, useFetchGameInfosQuery, useJoinGameMutation } from "../../types";
import { CircularProgress } from "@material-ui/core";

const joinPage: NextPage<{ joinGameId: string }> = ({ joinGameId }) => {
  const router = useRouter();
  const gameInfo = useFetchGameInfosQuery({
    variables: {
      gameId: joinGameId,
    },
  });
  const [nickName, setNickname] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>("");
  const [inviteeNickName, setInviteeNickName] = useState("");
  const [joinGame, joinGameData] = useJoinGameMutation();
  const [createUser, userData] = useCreateUserMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await joinGameAndCreateUser();
  };

  const joinGameAndCreateUser = async () => {
    if (nickName.length < 4) {
      setErrorMessage("Error: Your nickname must be greater than 3 characters long!");
    }
    try {
      await createUser({ variables: { username: nickName } });
      var res = await joinGame({ variables: { gameId: joinGameId } });
    } catch (error) {
      setErrorMessage(String(error));
    }
    router.push(`/game/${res.data.joinGame.gameUUID}`);
  };

  const handleInviteeNickName = () => {
    setInviteeNickName(gameInfo.data.fetchGameInfos.user1.nickname);
  };

  useEffect(() => {
    try {
      handleInviteeNickName();
    } catch {}
  }, [gameInfo.loading]);

  const joinPageMessage = () => {
    if (gameInfo.loading) {
      return <CircularProgress color='primary' size={100} />;
    } else if (gameInfo.error) {
      // router.push("/");
      return <div>error</div>;
    } else {
      return (
        <>
          <div className={stylesJoin.formGrid}>
            <div style={{ gridRow: 2 }}>
              <div className={stylesJoin.inviteeText}>{inviteeNickName.toUpperCase()}</div>
              <div className={stylesJoin.inviteText}>{`Invited You To Play Connect Four!`}</div>
            </div>
            <div className={styles.formText} style={{ gridRow: 3, paddingTop: "20px" }}>
              your nickname:
            </div>
            <form
              className={styles.formStyle}
              onSubmit={(e) => {
                handleSubmit(e);
              }}
            >
              <input
                className={styles.nickNameInput}
                style={{ gridRow: 4, paddingTop: "20px", gridColumn: 1 }}
                value={nickName}
                onChange={(e) => {
                  setNickname(e.target.value);
                }}
              />

              <button className={styles.submitButton} style={{ gridRow: 5, gridColumn: 1 }}>
                Join Game!
              </button>
            </form>
          </div>
          <div className={styles.errorMessage} style={{ gridRow: 6 }}>
            {errorMessage}
          </div>
        </>
      );
    }
  };

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
              {joinPageMessage()}
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
