import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";
import { AppProps } from "next/app";
import Head from "next/head";
import React from "react";


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

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <ThemeProvider theme={theme}>
          <Head>
            <meta
              name='viewport'
              content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover'
            />
	   <link rel="shortcut icon" href="/static/favicon.ico" />
           <title>Connect4Online</title>
           <meta property="og:title" content="Connect4Online" key="title" />
          </Head>
          <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
};

export default MyApp;
