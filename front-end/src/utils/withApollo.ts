import { withApollo as createWithApollo } from "next-apollo";
import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { NextPageContext } from "next";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

const httpLink = new HttpLink({
  uri: '/graphql/',
  credentials: "include"
});


const wsLink = process.browser ? new WebSocketLink({
  uri: `wss://www.connect4online.xyz/graphql/`,
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


const createClient = (ctx?: NextPageContext) =>
  new ApolloClient({
    uri: `http://www.connect4online.xyz/graphql/`,
    credentials: "include",
    headers: {
      cookie:
        (typeof window === "undefined"
          ? ctx?.req?.headers.cookie
          : undefined) || "",
    },
    cache: new InMemoryCache(),
    link: splitLink,
  });

export const withApollo = createWithApollo(createClient); 
