
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import styles from "../pages/index.module.css";
import {  CircularProgress,  } from "@material-ui/core";
import stylesJoin from "../pages/join/joinGame.module.css";
import { useFetchGameInfosQuery, useJoinGameMutation, useCreateUserMutation } from "../types";

interface JoinPageProps {
  joinGameId: string;
}

const JoinPageMessage: React.FC<JoinPageProps> = ({ joinGameId }) => {
  const router = useRouter();
  const [nickName, setNickname] = useState<string>("");
  const [inviteeNickName, setInviteeNickName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>("");
  const [jsx, setJSX] = useState<JSX.Element>(<></>);
  const gameInfo = useFetchGameInfosQuery({ variables: { gameId: joinGameId } });
  const [recieved, setRecieved] = useState<boolean>(false);
  const [callJoinGame, joinGameData] = useJoinGameMutation();
  const [createUser, userData] = useCreateUserMutation();

  const joinGameAndCreateUser = async () => {
    if (nickName.length < 4) {
      setErrorMessage("Error: Your nickname must be greater than 3 characters long!")
    }
    try {
      await createUser({variables: {username: nickName}});
      try {
        const res = await callJoinGame({ variables: { gameId: joinGameId } });
        router.push(`/game/${res.data.joinGame._id}`);
      } catch (error) {
        setErrorMessage(String(error));
      }
    } catch (error) {
      console.log("err", error);
      setErrorMessage(String(error));
    }
  };

  const handleInviteeNickName = () => {
    setInviteeNickName(gameInfo.data.fetchGameInfos.user1.nickname);
  };

  useEffect(() => {
    try {
      handleInviteeNickName();
    } catch {}
  }, [gameInfo.loading]);

  if (gameInfo.loading) {
    return <CircularProgress color='primary' size={100} />;
  } else {
    return (
      <div className={stylesJoin.formGrid}>
        <div style={{ gridRow: 2 }}>
          <div className={stylesJoin.inviteeText}>{inviteeNickName.toUpperCase()}</div>
          <div className={stylesJoin.inviteText}>{`Invited You To Play Connect Four!`}</div>
        </div>
        <div className={styles.formText} style={{ gridRow: 3, paddingTop: "20px" }}>
          your nickname:
        </div>
        <input
          className={styles.nickNameInput}
          style={{ gridRow: 4, paddingTop: "20px" }}
          value={nickName}
          onChange={(e) => {
            setNickname(e.target.value);
          }}
        />
        <button
          className={styles.submitButton}
          style={{ gridRow: 5 }}
          onClick={() => {
            joinGameAndCreateUser();
          }}
        >
          Join Game!
        </button>
        <div className={styles.errorMessage} style={{ gridRow: 6,}}>{errorMessage}</div>
      </div>
    );
  }
};

export default JoinPageMessage;
