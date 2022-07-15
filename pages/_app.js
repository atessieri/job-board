import '../styles/globals.css';
import { SessionProvider, useSession } from 'next-auth/react';

function Auth({ children }) {
  const { status } = useSession();
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  return children;
}

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <Auth>
        <Component {...pageProps} />
      </Auth>
    </SessionProvider>
  );
}

export default MyApp;
