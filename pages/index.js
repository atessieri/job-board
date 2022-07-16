import prisma from 'lib/prisma';
import { getJobs, getUser } from 'lib/data';
import Jobs from 'components/Jobs';
import { getSession } from 'next-auth/react';
import PageLayout from 'components/PageLayout';

export default function Home({ jobs, user }) {
  return (
    <PageLayout user={user}>
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
