import { useState } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import prisma from 'lib/prisma';
import { getUser } from 'lib/data';
import Link from 'next/link';
import PageLayout from 'components/PageLayout';

export default function NewJob({ user }) {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [salary, setSalary] = useState('');
  const [location, setLocation] = useState('');
  const { data: session } = useSession();
  let userNav;

  if (!session || !session.user) {
    return null;
  }
  if (user) {
    userNav = {
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.company ? 'company' : 'worker',
    };
  }
  return (
    <PageLayout currentPage={'New Job'} user={userNav}>
      <div className='text-center p-4 m-4'>
        <Link href={`/`}>
          <a href='' className='mb-10 text-sm font-bold underline'>
            back
          </a>
        </Link>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          try {
            await fetch('/api/job', {
              body: JSON.stringify({
                title,
                description,
                location,
                salary,
              }),
              headers: {
                'Content-Type': 'application/json',
              },
              method: 'POST',
            });

            router.push('/dashboard');
          } catch (error) {
            console.error(error);
          }
        }}
      >
        <div className='flex flex-col w-1/2 mx-auto'>
          <h2 className='mt-10 mb-10 text-4xl font-bold'>Post a new job!</h2>
          <div className=' pt-2 mt-2 mr-1'>
            <input
              className='border p-4 w-full text-lg font-medium bg-transparent outline-none color-primary '
              placeholder='Job title'
              required
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className=' pt-2 mt-2 mr-1 '>
            <textarea
              className='border p-4 w-full text-lg font-medium bg-transparent outline-none color-primary '
              rows={2}
              cols={50}
              placeholder='Job description'
              required
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className=' pt-2 mt-2 mr-1'>
            <input
              className='border p-4 w-full text-lg font-medium bg-transparent outline-none color-primary '
              placeholder='Salary'
              required
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>
          <div className=' pt-2 mt-2 mr-1'>
            <input
              className='border p-4 w-full text-lg font-medium bg-transparent outline-none color-primary '
              placeholder='Location'
              required
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className='mt-5'>
            <button className='border float-right px-8 py-2 mt-0  font-bold rounded-full'>Post job</button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      props: {},
    };
  }
  let user = await getUser(session.user.id, prisma);
  user = JSON.parse(JSON.stringify(user));
  return {
    props: {
      user,
    },
  };
}
