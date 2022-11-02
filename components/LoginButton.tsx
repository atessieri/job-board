import { signIn } from 'next-auth/react';

export default function LoginButton() {
  return (
    <div className='flex-shrink-0'>
      <button
        type='button'
        className='relative inline-flex items-center px-4 py-2 border border-transparent rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        onClick={async () => {
          await signIn();
        }}
      >
        Login
      </button>
    </div>
  );
}
