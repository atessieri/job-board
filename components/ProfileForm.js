import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import GrayMan from 'components/GrayMan';
import { faker } from '@faker-js/faker';
import { Role } from '@prisma/client';

function LabelEdit({ label, type, text, setText, pattern = '.*' }) {
  return (
    <div className='sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5'>
      <label htmlFor='text' className='block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2'>
        {label}
      </label>
      <div className='mt-1 sm:mt-0 sm:col-span-2'>
        <div className='max-w-lg flex rounded-md shadow-sm'>
          <input
            type={type}
            name='text'
            id='text'
            autoComplete={label}
            pattern={pattern}
            className='flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300'
            value={text}
            required
            onChange={(event) => {
              if (setText) setText(event.target.value);
            }}
          />
        </div>
      </div>
    </div>
  );
}

function LabelImage({ label, image, setImage }) {
  return (
    <div className='sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center sm:border-t sm:border-gray-200 sm:pt-5'>
      <label htmlFor='photo' className='block text-sm font-medium text-gray-700'>
        {label}
      </label>
      <div className='mt-1 sm:mt-0 sm:col-span-2'>
        <div className='flex items-center'>
          <div className='flex items-center space-x-3'>
            <div className='flex rounded-full'>
              {image ? (
                <Image src={image} alt='' width='50' height='50' className='rounded-full' />
              ) : (
                <GrayMan className='h-10 w-10' />
              )}
            </div>
          </div>
          <button
            type='button'
            className='ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            onClick={(event) => {
              event.preventDefault();
              if (setImage) {
                setImage(faker.image.avatar());
              }
            }}
          >
            Change
          </button>
          <button
            type='button'
            className='ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            onClick={(event) => {
              event.preventDefault();
              if (setImage) {
                setImage(null);
              }
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

async function profileSave(username, name, role, image) {
  try {
    await fetch('/api/v1.0/userProfile', {
      body: JSON.stringify({
        username,
        name,
        role,
        image,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
    });
  } catch (error) {
    console.log(error.message);
    alert('Error during saving');
  }
}

export default function ProfileForm({ user }) {
  const [username, setUsername] = useState(user.username);
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [image, setImage] = useState(user.image);
  const router = useRouter();
  return (
    <div className='mt-10'>
      <div className='text-center p-4 m-4'>
        <h2 className='mb-10 text-4xl font-bold'>Profile</h2>
      </div>
      <form className='m-8 space-y-8 divide-y divide-gray-200'>
        <div className='space-y-8 divide-y divide-gray-200 sm:space-y-5'>
          <div className='mt-6 sm:mt-5 space-y-6 sm:space-y-5'>
            <LabelEdit label='Username' type='text' text={username} setText={setUsername} pattern='[a-zA-Z0-9.]{1,}' />
            <LabelEdit label='E-mail' type='email' text={user.email} />
            <LabelEdit label='Name' type='text' text={name} setText={setName} pattern='[a-zA-Z0-9\s]{1,}' />
            <LabelImage label='Photo' image={image} setImage={setImage} />
            <div className='sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5'>
              <label htmlFor='country' className='block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2'>
                Country
              </label>
              <div className='mt-1 sm:mt-0 sm:col-span-2'>
                <select
                  id='role'
                  name='role'
                  autoComplete='role'
                  value={role}
                  className='max-w-lg block focus:ring-indigo-500 focus:border-indigo-500 w-full shadow-sm sm:max-w-xs sm:text-sm border-gray-300 rounded-md'
                  required
                  onChange={(event) => {
                    setRole(event.target.value);
                  }}
                >
                  <option value={Role.ADMIN}>Administrator</option>
                  <option value={Role.COMPANY}>Company</option>
                  <option value={Role.WORKER}>Worker</option>
                </select>
              </div>
            </div>
            <div className='pt-5'>
              <div className='flex justify-end'>
                <button
                  type='button'
                  className='bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  onClick={(event) => {
                    event.preventDefault();
                    router.push('/');
                  }}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  onClick={async (event) => {
                    event.preventDefault();
                    await profileSave(username, name, role, image);
                    router.push('/profile');
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}