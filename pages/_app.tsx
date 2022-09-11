import 'styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider, useSession } from 'next-auth/react';

type AuthProps = {
  children: JSX.Element;
};

function Auth({ children }: AuthProps) {
  const { status } = useSession();
  if (status === 'loading') {
    return <div>Loading...</div>;
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
