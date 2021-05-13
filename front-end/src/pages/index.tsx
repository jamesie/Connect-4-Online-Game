import React, { useRef, useState } from "react";
import Grid from "@material-ui/core/Grid";
import { Button, Paper, TextField, Box } from "@material-ui/core";
import styles from "./index.module.css";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import ReCAPTCHA from "react-google-recaptcha";
import { useCreateUserMutation, useCreateGameMutation } from "../types";
import { withApollo } from "../utils/withApollo";
import Head from "next/head";

interface indexProps {}

const index: React.FC<indexProps> = ({}) => {
  const [nickName, setNickname] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>("");
  const router = useRouter();
  const reRef = useRef<ReCAPTCHA>();
  const [createUser, createUserRes] = useCreateUserMutation({ variables: { username: nickName } });
  const [createGame, createGameRes] = useCreateGameMutation();

  const fetchGCT = async () => {
    return reRef.current.executeAsync();
  };

  const createGameAndUser = async (): Promise<void> => {
    if (nickName.length < 4) {
      setErrorMessage("Your nickname must be greater than 3 characters long!");
    }
    try {
      await createUser();
      try {
        const res = await createGame({ variables: { googleCaptchaToken: await fetchGCT() } });
        router.push(`/game/${res.data.createGame.gameUUID}`);
      } catch (error) {
        setErrorMessage(String(error));
      }
    } catch (error) {
      setErrorMessage(String(error));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createGameAndUser();
  };

  return (
    <>
      <Head>
        <meta property='og:title' content='Connect4Online | Play Multiplayer Connect4 Online With Friends!' />
        <meta property='og:type' content='website' />
        <meta property='og:url' content='http://www.connect4online.xyz' />
        <meta property='og:image' content='https://i.imgur.com/aeNjMa7.png' />
        <meta
          property='og:description'
          content='A site made for easily playing the classic game of connect 4 with friends and family.'
        />
        <meta name='theme-color' content='#4b7ff6' />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='keywords' content='Connect4 Connect Four Multiplayer Online Game' />
      </Head>
      <div className={styles.gradientBG}>
        <div style={{ display: "grid", placeItems: "center", left: 0, right: 0, top: 0, bottom: 0, position: "fixed" }}>
          <div style={{ display: "grid" }}>
            <div style={{ gridRow: 1, marginBottom: "2vh" }}>
              <div className={styles.titlescreen}>Welcome To</div>
              <div className={styles.titlescreen}>ConnectFourOnline.xyz</div>
            </div>
            <div style={{ gridRow: 2, display: "grid" }} className={styles.startGameWrapper}>
              <div className={styles.formText} style={{ gridRow: 1, paddingTop: "20px" }}>
                your nickname:
              </div>
              <form 
              className={styles.formStyle}
              onSubmit={async (e) => {await handleSubmit(e)}
              }>
                  <input
                    className={styles.nickNameInput}
                    style={{ gridRow: 2, paddingTop: "20px" }}
                    value={nickName}
                    onChange={(e) => {
                      setNickname(e.target.value);
                    }}
                  />
                  <button
                    className={styles.submitButton}
                    style={{ gridRow: 3 }}
                    onClick={() => {}}
                  >
                    Create Game!
                  </button>
              </form>
              <div className={styles.errorMessage}>{errorMessage}</div>
            </div>
          </div>
        </div>
      </div>
      <ReCAPTCHA sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY} size='invisible' ref={reRef} />
    </>
  );
};

export default withApollo({ ssr: true })(index);
