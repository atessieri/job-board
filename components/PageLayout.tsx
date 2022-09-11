import NavBar from 'components/NavBar';
import ProfileDialog from 'components/ProfileDialog';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import type { NavigationConfig, UserNavigationConfig } from 'components/NavBar';
import type { User } from 'lib/database/UserManage';

type PageLayoutProps = {
  user?: User;
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

const logo: string = '/logo.png';

export default function PageLayout({ user, children }: PageLayoutProps) {
  const router = useRouter();
  let [isOpen, setIsOpen] = useState(false);
  let navigation;
  if (!user) {
    navigation = guestNav;
  } else {
    switch (user.role) {
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
  }
  navigation.map((item) => {
    if (item.href === router.pathname) {
      item.current = true;
    } else {
      item.current = false;
    }
  });
  const userNavigation: UserNavigationConfig[] = [
    { name: 'Profile', action: () => setIsOpen(true) },
    { name: 'Logout', action: async () => await signOut() },
  ];
  return (
    <div className='max-w-7xl mx-auto'>
      <NavBar logo={logo} navigation={navigation} userNavigation={userNavigation} user={user} />
      <ProfileDialog user={user} isOpen={isOpen} onExit={() => setIsOpen(false)} />
      {children}
    </div>
  );
}
