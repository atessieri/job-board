import { getSession } from 'next-auth/react';
import prisma from 'lib/prisma';
import { getUser, getJobs } from 'lib/data.js';
import { useRouter } from 'next/router';
import Jobs from 'components/Jobs';
import PageLayout from 'components/PageLayout';

export default function Dashboard({ jobs, user }) {
  const router = useRouter();
  if (!user) {
    router.push('/');
    return null;
  }
  return (
    <PageLayout user={user}>
      <div className='mt-10'>
        <div className='text-center p-4 m-4'>
          <h2 className='mb-10 text-4xl font-bold'>Dashboard</h2>
        </div>
        <div className='sm:flex sm:items-center'>
          <div className='mt-4 sm:mt-0 sm:ml-16 sm:flex-none'>
            <button
              type='button'
              className='inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto'
            >
              Add job
            </button>
          </div>
        </div>
        <Jobs jobs={jobs} isDashboard={true} />
      </div>
    </PageLayout>
  );
}

export async function getServerSideProps(context) {
  let props = {};
  try {
    const session = await getSession(context);
    if (session) {
      let user;
      user = await getUser(prisma, session.user.id);
      user = JSON.parse(JSON.stringify(user));
      props.user = {
        name: user.name,
        email: user.email,
        username: user.username,
        image: user.image,
        role: user.role,
      };
      props.jobs = await getJobs(prisma, false, session.user.id, 10);
      props.jobs = JSON.parse(JSON.stringify(props.jobs));
    }
  } catch (error) {
    console.log(error.message);
    props = {};
  }
  return { props };
}
