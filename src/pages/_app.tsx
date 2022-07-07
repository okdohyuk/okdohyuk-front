import React from 'react';
import '~/styles/globals.css';
import { AppProps } from 'next/app';
import { Provider } from 'mobx-react';
/*import { useStore } from '~/stores/index';*/
import stores from '~/stores';

function MyApp({ Component, pageProps }: AppProps) {
  /*const store = useStore(pageProps.initialState);*/

  return (
    <Provider {...stores}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;
