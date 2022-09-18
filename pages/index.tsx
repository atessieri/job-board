import Jobs from 'components/Jobs';
import JobTable from 'components/JobTable';
import PageLayout from 'components/PageLayout';
import JobManage from 'lib/database/JobManage';
import prisma from 'lib/database/prisma';
import UserManage from 'lib/database/UserManage';
import { genericServerSideProps } from 'lib/apiHandler';
import Error from 'next/error';

import type { Session } from 'next-auth';

import type { JobWithAuthor } from 'lib/database/JobManage';

import type { Props } from 'lib/apiHandler';

import type User from 'lib/database/UserManage';

import type { GetServerSidePropsContext } from 'next';

import type { ServerSidePropsCallback } from 'lib/apiHandler';

type DataProps = {
  user?: User;
  jobs?: JobWithAuthor[];
};

export default function Home({ data, errorInfo }: Props<DataProps>) {
  if (errorInfo.errorHappen) {
    return <Error statusCode={errorInfo.errorCode} title={errorInfo.errorMessage} />;
  }
  const user = typeof data !== 'undefined' ? data.user : undefined;
  const jobs = typeof data !== 'undefined' ? data.jobs : undefined;
  return (
    <PageLayout user={user}>
      <div className='mt-10'>
        <div className='text-center p-4 m-4'>
          <h2 className='mb-10 text-4xl font-bold'>Find a job!</h2>
        </div>
        <JobTable user={user} jobs={jobs} displayPublished={false} />
        <Jobs jobs={jobs} isDashboard={true} />
      </div>
    </PageLayout>
  );
}

const serverSidePropsCallback: ServerSidePropsCallback<DataProps> = async (
  context: GetServerSidePropsContext,
  session: Session | null,
) => {
  let result: DataProps = {};
  if (session) {
    result.user = await UserManage.getUser(prisma, session.user.id);
  }
  result.jobs = await JobManage.getJobs(prisma, true, undefined, 10);
  return result;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await genericServerSideProps<DataProps>(context, serverSidePropsCallback);
}
