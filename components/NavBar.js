/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import GrayMan from 'components/GrayMan';
import Link from 'next/link';
import Image from 'next/image';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function ImageName({ className, user }) {
  if (!user) {
    return null;
  }
  return (
    <div className='flex items-center space-x-3'>
      <div className='flex rounded-full'>
        {user.image ? (
          <Image src={user.image} alt='' width='50' height='50' className='rounded-full' />
        ) : (
          <GrayMan className='h-10 w-10' />
        )}
      </div>
      <span className={classNames(className, 'text-blue-800')}>{user.name ? user.name : user.email}</span>
    </div>
  );
}

function LoginButton({ login }) {
  if (!login) {
    return null;
  }
  return (
    <div className='flex-shrink-0'>
      <button
        type='button'
        className='relative inline-flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        onClick={() => {
          login();
        }}
      >
        Login
      </button>
    </div>
  );
}

function UserMenuDropDown({ userNavigation, user }) {
  if (!userNavigation || !user) {
    return null;
  }
  return (
    <div className='hidden sm:ml-4 sm:flex-shrink-0 sm:flex sm:items-center'>
      <Menu as='div' className='ml-3 relative'>
        <Menu.Button className='bg-white'>
          <span className='sr-only'>Open user menu</span>
          <ImageName className='hidden md:block text-sm' user={user} />
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
                  )}
                </Menu.Item>
              ))}
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}

export default function NavBar({ logo, navigation, userNavigation, user, login, logout }) {
  return (
    <Disclosure as='nav' className='bg-white shadow text-base font-bold'>
      {({ open }) => (
        <>
          <div className='px-4 py-3 sm:px-6 lg:px-8'>
            <div className='flex justify-between h-16'>
              <div className='flex'>
                <div className='flex-shrink-0 flex items-center'>
                  <div className='block rounded-full'>
                    {logo && <Image src={logo} alt='Logo Job Board' width='50' height='50' />}
                  </div>
                </div>
                <div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
                  {navigation &&
                    navigation.map((item) => (
                      <div
                        key={item.name}
                        className={classNames(
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
                {user ? (
                  <UserMenuDropDown userNavigation={userNavigation} user={user} logout={logout} />
                ) : (
                  <LoginButton login={login} />
                )}
              </div>
              <div className='-mr-2 flex items-center sm:hidden'>
                {/* Mobile menu button */}
                <Disclosure.Button className='inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500'>
                  <span className='sr-only'>Open main menu</span>
                  {open ? (
                    <XIcon className='block h-6 w-6' aria-hidden='true' />
                  ) : (
                    <MenuIcon className='block h-6 w-6' aria-hidden='true' />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>
          <Disclosure.Panel className='sm:hidden'>
            <div className='pt-2 pb-3 space-y-1'>
              {navigation &&
                navigation.map((item) => (
                  <div
                    key={item.name}
                    className={classNames(
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
                <ImageName className='text-sm' user={user} />
              </div>
              <div className='mt-3 space-y-1'>
                {userNavigation &&
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
        </>
      )}
    </Disclosure>
  );
}
