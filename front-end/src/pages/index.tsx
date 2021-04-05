import React from "react";
import Grid from "@material-ui/core/Grid";
import { Button, Paper, TextField, Box } from "@material-ui/core";
import styles from "./index.module.css";
import { gql, useMutation, useQuery } from "@apollo/client";
import {useRouter} from "next/router";

interface indexProps {}

const index: React.FC<indexProps> = ({}) => {

  const router = useRouter()
  const makeUser = gql`
    mutation CreateUser($username: String!) {
      createUser(username: $username) {
        _id
        nickname
      }
    }
  `;

  const [makeUser1, { data }] = useMutation(makeUser);

  return (
    <div className={styles.centerdiv}>
      <h1 className={styles.titlescreen}>Welcome to Connect4Online.xyz!</h1>
      <Button
        color='primary'
        variant='contained'
        size='large'
        onClick={async () => {
          console.log(await (await makeUser1({ variables: { username: "testuser1" } })).data);
          router.push("/");
        }}
      >
        Click to start a game!
      </Button>
    </div>
  );
};

export default index;
