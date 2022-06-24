import prisma from 'lib/prisma';
import { getJobs, getUser } from 'lib/data';
import Jobs from 'components/Jobs';
import { useSession, getSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function Home({ jobs, user }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  if (loading) return null;

  if (!loading && session && !session.user.name) {
    router.push('/setup');
  }

  return (
    <div className="mt-10">
      <div className="text-center p-4 m-4">
        <h2 className="mb-10 text-4xl font-bold">Find a job!</h2>
      </div>

      {!session && (
        <div className="flex justify-center">
          <button
            className="border px-8 py-2 mt-5 font-bold rounded-full bg-black text-white border-black"
            onClick={() => signIn()}
          >
            login
          </button>
        </div>
      )}

      {session && (
        <>
          <p className="mb-10 text-2xl font-normal text-center">
            Welcome, {user.name}
            {user.company && <span className="bg-black text-white uppercase text-sm p-2">Company</span>}
          </p>
          {user.company ? (
            <div className="flex justify-center">
              <button
                className="border px-8 py-2 mt-5 font-bold rounded-full bg-black text-white border-black "
                onClick={() => {
                  router.push('/new');
                }}
              >
                click here to post a new job
              </button>
              <button
                className="ml-5 border px-8 py-2 mt-5 font-bold rounded-full bg-black text-white border-black "
                onClick={() => {
                  router.push('/dashboard');
                }}
              >
                see all the jobs you posted
              </button>
              <button
                className="ml-5 border px-8 py-2 mt-5 font-bold rounded-full bg-black text-white border-black "
                onClick={() => {
                  signOut();
                }}
              >
                logout
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                className="ml-5 border px-8 py-2 mt-5 font-bold rounded-full bg-black text-white border-black "
                onClick={() => {
                  router.push('/dashboard');
                }}
              >
                see all the jobs you applied to
              </button>
              <button
                className="ml-5 border px-8 py-2 mt-5 font-bold rounded-full bg-black text-white border-black "
                onClick={() => {
                  signOut();
                }}
              >
                logout
              </button>
            </div>
          )}
        </>
      )}

      <Jobs jobs={jobs} isDashboard={true} />
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  let jobs = await getJobs(prisma);
  jobs = JSON.parse(JSON.stringify(jobs));

  if (!session) {
    return {
      props: { jobs },
    };
  }

  let user = await getUser(session.user.id, prisma);
  user = JSON.parse(JSON.stringify(user));

  return {
    props: {
      jobs,
      user,
    },
  };
}
