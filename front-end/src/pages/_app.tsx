import { AppProps } from "next/app";
import Head from "next/head";
import { ApolloProvider } from "@apollo/client";
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
  credentials: 'include'
});


const MyApp = ({ Component, pageProps }: AppProps) => {


  return (
    <>
      <ApolloProvider client={client}>
        <Head>
          <meta
            name='viewport'
            content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover'
          />
        </Head>

        <Component {...pageProps} />
      </ApolloProvider>
    </>
  );
};

export default MyApp;
