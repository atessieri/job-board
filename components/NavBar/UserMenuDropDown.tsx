import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import ImageName from 'components/ImageName';

import type { UserNavigationConfig } from 'components/NavBar/NavBar';

type UserMenuDropDownProps = {
  userNavigation: UserNavigationConfig[];
};

export default function UserMenuDropDown({ userNavigation }: UserMenuDropDownProps) {
  return (
    <div className='hidden sm:ml-4 sm:flex-shrink-0 sm:flex sm:items-center'>
      <Menu as='div' className='ml-3 relative'>
        <Menu.Button className='bg-white'>
          <span className='sr-only'>Open user menu</span>
          <ImageName className='hidden md:block text-sm' />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter='transition ease-out duration-200'
          enterFrom='transform opacity-0 scale-95'
          enterTo='transform opacity-100 scale-100'
          leave='transition ease-in duration-75'
          leaveFrom='transform opacity-100 scale-100'
          leaveTo='transform opacity-0 scale-95'
        >
          <Menu.Items className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'>
            {userNavigation &&
              userNavigation.map((item) => (
                <Menu.Item key={item.name}>
                  {() => (
                    <Link
                      href={item.href}
                      className='block px-4 py-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                    >
                      {item.name}
                    </Link>
                  )}
                </Menu.Item>
              ))}
            <Menu.Item>
              <button
                className='block px-4 py-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                onClick={(event) => {
                  event.preventDefault();
                  signOut();
                }}
              >
                {'Logout'}
              </button>
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
