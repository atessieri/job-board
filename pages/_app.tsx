import 'styles/globals.css';
import { SessionProvider, useSession } from 'next-auth/react';
import { Spinner } from 'components/Spinner';
import { Provider } from 'react-redux';
import store from 'lib/client/redux/store';

import type { Session } from 'next-auth';
import type { AppProps } from 'next/app';

type AuthProps = {
  children: JSX.Element;
};

function Auth({ children }: AuthProps) {
  const { status } = useSession();
  if (status === 'loading') {
    return <Spinner text='Loading...' />;
  }
  return children;
}

function App({ Component, pageProps: { session, ...pageProps } }: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <Auth>
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      </Auth>
    </SessionProvider>
  );
}

export default App;
