import NavBar from 'components/NavBar';
import ProfileDialog from 'components/ProfileDialog';
import { useState, useEffect } from 'react';
import { signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

const adminNav = [{ name: 'Utils', href: '/utils', current: true }];

const companyNav = [
  { name: 'Jobs', href: '/', current: false },
  { name: 'Dashboard', href: '/dashboard', current: false },
];

const workerNav = [
  { name: 'Jobs', href: '/', current: false },
  { name: 'Dashboard', href: '/dashboard', current: false },
];

const guestNav = [{ name: 'Jobs', href: '/', current: false }];

const logo = '/logo.png';

export default function PageLayout({ user, children }) {
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
  const userNavigation = [
    { name: 'Profile', action: () => setIsOpen(true) },
    { name: 'Logout', action: signOut },
  ];
  return (
    <div className='max-w-7xl mx-auto'>
      <NavBar logo={logo} navigation={navigation} userNavigation={userNavigation} user={user} login={signIn} />
      <ProfileDialog user={user} isOpen={isOpen} onExit={() => setIsOpen(false)} />
      {children}
    </div>
  );
}
