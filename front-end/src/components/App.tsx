import React from 'react';
import Head from 'next/head';

export namespace App {
  export interface Props {
    title: string;
  }
  export interface State { }
}

const App = ({props}) => {

    return (
      <div>
        <Head>
          <title>{props.title}</title>
          <meta name='viewport' content='initial-scale=1.0, width=device-width' />
        </Head>
        <div>
          {props.children}
        </div>
      </div>
    );
}

export default App;