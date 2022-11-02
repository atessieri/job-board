import Image from 'next/image';
import Link from 'next/link';
import classnames from 'classnames';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useGetUserQuery } from 'lib/client/redux/userSlice';
import LoginButton from 'components/LoginButton';
import ImageName from 'components/ImageName';
import Logo from 'components/Logo';
import UserMenuDropDown from 'components/NavBar/UserMenuDropDown';

export type NavigationConfig = {
  name: string;
  href: string;
  current: boolean;
};

export type UserNavigationConfig = {
  name: string;
  href: string;
};

type NavBarProps = {
  navigation: NavigationConfig[];
  userNavigation: UserNavigationConfig[];
};

export default function NavBar({ navigation, userNavigation }: NavBarProps) {
  const { currentData: user, isLoading, isError } = useGetUserQuery();
  const userAvailable = isLoading === false && isError === false && typeof user !== 'undefined';
  return (
    <Disclosure as='nav' className='bg-white shadow text-base font-bold'>
      {({ open }) => (
        <>
          <div className='px-4 py-3 sm:px-6 lg:px-8'>
            <div className='flex justify-between h-16'>
              <div className='flex'>
                <div className='flex-shrink-0 flex items-center'>
                  <Logo />
                </div>
                <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
                  {navigation &&
                    navigation.map((item) => (
                      <div
                        key={item.name}
                        className={classnames(
                          item.current
                            ? 'border-indigo-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                          'inline-flex items-center px-1 pt-1 border-b-2',
                        )}
                      >
                        <Link href={item.href}>{item.name}</Link>
                      </div>
                    ))}
                </div>
              </div>
              <div className='hidden sm:flex sm:items-center'>
                {userAvailable ? (
                  <UserMenuDropDown userNavigation={userNavigation} />
                ) : (
                  <LoginButton />
                )}
              </div>
              <div className='-mr-2 flex items-center sm:hidden'>
                {/* Mobile menu button */}
                <Disclosure.Button className='inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'>
                  <span className='sr-only'>Open main menu</span>
                  {open ? (
                    <XMarkIcon className='block h-6 w-6' aria-hidden='true' />
                  ) : (
                    <Bars3Icon className='block h-6 w-6' aria-hidden='true' />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>
          {/*
          <Disclosure.Panel className='sm:hidden'>
            <div className='pt-2 pb-3 space-y-1'>
              {navigation &&
                navigation.map((item) => (
                  <div
                    key={item.name}
                    className={classnames(
                      item.current
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700',
                      'block pl-3 pr-4 py-2 border-l-4',
                    )}
                  >
                    <Link href={item.href}>{item.name}</Link>
                  </div>
                ))}
            </div>
            <div className='pt-4 pb-3 border-t border-gray-200'>
              <div className='flex items-center px-4'>
                <ImageName className='text-sm' />
              </div>
              <div className='mt-3 space-y-1'>
                {!user && <LoginButton />}
                {user &&
                  userNavigation &&
                  userNavigation.map((item) => (
                    <button
                      key={item.name}
                      className='block px-4 py-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                      onClick={(event) => {
                        event.preventDefault();
                        item.action();
                      }}
                    >
                      {item.name}
                    </button>
                  ))}
              </div>
            </div>
          </Disclosure.Panel>
                    */}
        </>
      )}
    </Disclosure>
  );
}
