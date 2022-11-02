import NavBar from 'components/NavBar/NavBar';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useGetUserQuery } from 'lib/client/redux/userSlice';

import type { NextRouter } from 'next/router';
import type { NavigationConfig, UserNavigationConfig } from 'components/NavBar/NavBar';
import type { UserType } from 'lib/server/database/userManage';

type PageLayoutProps = {
  children?: JSX.Element;
};

const adminNav: NavigationConfig[] = [
  { name: 'Home', href: '/', current: true },
  { name: 'User manage', href: '/usermanage', current: false },
];

const companyNav: NavigationConfig[] = [
  { name: 'Home', href: '/', current: false },
  { name: 'Dashboard', href: '/dashboard', current: false },
];

const workerNav: NavigationConfig[] = [
  { name: 'Home', href: '/', current: false },
  { name: 'Dashboard', href: '/dashboard', current: false },
];

const guestNav: NavigationConfig[] = [{ name: 'Jobs', href: '/', current: false }];

const userNavigation: UserNavigationConfig[] = [
  { name: 'Profile', href: '/profile' },
  { name: 'Logout', href: '/api/auth/signout' },
];

function selectNavigation(router: NextRouter, userAvailable: boolean, user?: UserType) {
  let navigation: NavigationConfig[];
  switch (user?.role) {
    case 'ADMIN':
      navigation = adminNav;
      break;
    case 'COMPANY':
      navigation = companyNav;
      break;
    case 'WORKER':
      navigation = workerNav;
      break;
    default:
      navigation = guestNav;
      break;
  }
  navigation.map((item) => {
    if (item.href === router.pathname) {
      item.current = true;
    } else {
      item.current = false;
    }
  });
  return navigation;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const router = useRouter();
  const { currentData: user, isLoading, isError } = useGetUserQuery();
  const userAvailable = isLoading === false && isError === false && typeof user !== 'undefined';
  const navigation = useMemo(
    () => selectNavigation(router, userAvailable, user),
    [router, userAvailable, user],
  );
  return (
    <div className='max-w-7xl mx-auto'>
      <NavBar navigation={navigation} userNavigation={userNavigation} />
      {children}
    </div>
  );
}
