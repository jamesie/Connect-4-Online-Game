import { AppProps } from "next/app";
import Head from "next/head";
import { ApolloProvider, HttpLink, split } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import { WebSocketLink } from "@apollo/client/link/ws";
import { grey } from "@material-ui/core/colors";
import React from "react";
import { getMainDefinition } from "@apollo/client/utilities";

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: "include"
});

const wsLink = process.browser ? new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    reconnect: true,
    connectionParams : {
      credentials: "include"
    }
  }
}) : null;

const splitLink = process.browser ? split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
) : httpLink;

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
  credentials: "include",
  link: splitLink,
});

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
        <ApolloProvider client={client}>
          <Head>
            <meta
              name='viewport'
              content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover'
            />
          </Head>
          <Component {...pageProps} />
        </ApolloProvider>
      </ThemeProvider>
    </>
  );
};

export default MyApp;
