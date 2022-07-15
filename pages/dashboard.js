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
  const userNav = {
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
  };
  return (
    <PageLayout currentPage={'Dashboard'} user={userNav}>
      <div className='mt-10'>
        <div className='text-center p-4 m-4'>
          <h2 className='mb-10 text-4xl font-bold'>Find a job!</h2>
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
      props.user = await getUser(prisma, session.user.id);
      props.user = JSON.parse(JSON.stringify(props.user));
    }
    props.jobs = await getJobs(prisma, true, undefined, 10);
    props.jobs = JSON.parse(JSON.stringify(props.jobs));
  } catch (error) {
    console.log(error.message);
    props = {};
  }
  return { props };
}