import 'styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider, useSession } from 'next-auth/react';
import { Spinner } from 'components/Spinner';

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

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Auth>
        <Component {...pageProps} />
      </Auth>
    </SessionProvider>
  );
}

export default MyApp;
