import React from "react";
import Grid from "@material-ui/core/Grid";
import { Button, Paper, TextField, Box } from "@material-ui/core";
import styles from "./index.module.css";

interface indexProps {}

const index: React.FC<indexProps> = ({}) => {
  return (
    <div className={styles.centerdiv}>
      <h1 className={styles.titlescreen}>Welcome to Connect4Online.xyz!</h1>
      <Button color='primary' variant='contained' size="large">
        Click to start a game!
      </Button>
    </div>
  );
};

export default index;
