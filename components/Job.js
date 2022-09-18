import Link from 'next/link';
import { useRouter } from 'next/router';

function Job({ job, isDashboard }) {
  const router = useRouter();

  return (
    <div className='mb-4 mt-20 pl-16 pr-16'>
      <Link href={`/job/${job.id}`}>
        <a className='text-xl font-bold underline'>{job.title}</a>
      </Link>
      <h2 className='text-base font-normal mt-3'>{job.description}</h2>
      <div className='mt-4'>
        {isDashboard && job.published && (
          <span
            className='bg-black text-white uppercase text-sm p-2 mr-5 cursor-pointer'
            onClick={async () => {
              await fetch('/api/job', {
                body: JSON.stringify({
                  id: job.id,
                  task: 'unpublish',
                }),
                headers: {
                  'Content-Type': 'application/json',
                },
                method: 'PUT',
              });
              router.reload(window.location.pathname);
            }}
          >
            ✅ Published
          </span>
        )}
        {isDashboard && !job.published && (
          <span
            className='bg-black text-white uppercase text-sm p-2 mr-5 cursor-pointer'
            onClick={async () => {
              await fetch('/api/job', {
                body: JSON.stringify({
                  id: job.id,
                  task: 'publish',
                }),
                headers: {
                  'Content-Type': 'application/json',
                },
                method: 'PUT',
              });
              router.reload(window.location.pathname);
            }}
          >
            ❌ Unpublished
          </span>
        )}

        <h4 className='inline'>Posted by</h4>
        <div className='ml-1 -mt-6 inline'>
          <span className='text-base font-medium color-primary underline'>{job.author.name}</span>
        </div>
      </div>
    </div>
  );
}

export default Job;
