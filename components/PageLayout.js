import NavBar from 'components/NavBar';
import { signIn, signOut } from 'next-auth/react';

const adminNav = [
  { name: 'Utils', href: '/utils', current: true },
  { name: 'Profile', href: '/profile', current: false },
];

const companyNav = [
  { name: 'Jobs', href: '/', current: false },
  { name: 'Dashboard', href: '/dashboard', current: false },
  { name: 'New Job', href: '/newJob', current: false },
  { name: 'Profile', href: '/profile', current: false },
];

const workerNav = [
  { name: 'Jobs', href: '/', current: false },
  { name: 'Dashboard', href: '/dashboard', current: false },
  { name: 'Profile', href: '/profile', current: false },
];

const guestNav = [{ name: 'Jobs', href: '/', current: false }];

const userNavigation = [{ name: 'Profile', href: '/' }];

const logo = '/logo.png';

export default function PageLayout({ currentPage, user, children }) {
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
    if (item.name === currentPage) {
      item.current = true;
    } else {
      item.current = false;
    }
  });
  return (
    <div className='max-w-7xl mx-auto'>
      <NavBar
        logo={logo}
        navigation={navigation}
        userNavigation={userNavigation}
        user={user}
        login={signIn}
        logout={signOut}
      />
      {children}
    </div>
  );
}
