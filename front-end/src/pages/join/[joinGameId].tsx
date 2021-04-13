import { createMuiTheme } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { ThemeProvider } from "@material-ui/styles";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import JoinPageMessage from "../../components/JoinPageMessage";
import styles from "../index.module.css";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: grey[50],
    },
    secondary: {
      // This is green.A700 as hex.
      main: "#11cb5f",
    },
  },
});

const joinPage: NextPage<{ joinGameId: string }> = ({ joinGameId }) => {
  const router = useRouter();

  return (
    <ThemeProvider theme={theme}>
      <div className={styles.gradientBG}>
        <div style={{ display: "grid", placeItems: "center", left: 0, right: 0, top: 0, bottom: 0, position: "fixed" }}>
          <div style={{ display: "grid" }}>
            <div style={{ gridRow: 1, marginBottom: "2vh" }}>
              <div className={styles.titlescreen}>Welcome To</div>
              <div className={styles.titlescreen}>ConnectFourOnline.xyz</div>
            </div>
            <div style={{ gridRow: 2, display: "grid", placeItems: "center" }} className={styles.startGameWrapper}>
              <JoinPageMessage joinGameId={joinGameId} />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

joinPage.getInitialProps = ({ query }) => {
  return {
    joinGameId: query.joinGameId as string,
  };
};

export default joinPage;
