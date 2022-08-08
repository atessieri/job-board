import Jobs from 'components/Jobs';
import JobTable from 'components/JobTable';
import PageLayout from 'components/PageLayout';
import prisma from 'lib/database/prisma';
import User from 'lib/database/User';
import UserManage from 'lib/database/UserManage';
import { authOptions } from 'pages/api/auth/[...nextauth]';
import { unstable_getServerSession } from 'next-auth';
import type { UserJSON } from 'lib/database/User';

type Props = {
  user?: UserJSON;
};

export default function Home({ jobs, user }: Props) {
  return (
    <PageLayout user={user}>
      <div className='mt-10'>
        <div className='text-center p-4 m-4'>
          <h2 className='mb-10 text-4xl font-bold'>Find a job!</h2>
        </div>
        <JobTable user={user} jobs={jobs} displayPublished={true} />
        <Jobs jobs={jobs} isDashboard={true} />
      </div>
    </PageLayout>
  );
}

export async function getServerSideProps(context) {
  let props: Props = {};
  try {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    if (session) {
      const userManage = new UserManage(prisma);
      const user = await userManage.getUser(session.user.id);
      if (user != null) {
        props.user = user.toJSON();
        console.log(props.user);
      }
    }
    //    props.jobs = await getJobs(prisma, true, undefined, 10);
    //    props.jobs = JSON.parse(JSON.stringify(props.jobs));
  } catch (error) {
    console.log(error.message);
    props = {};
  }
  return { props };
}
