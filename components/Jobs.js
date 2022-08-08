import Job from 'components/Job';

const Jobs = ({ jobs, isDashboard }) => {
  if (!jobs) return null;

  return (
    <div className='block sm:hidden'>
      {jobs.map((job, index) => (
        <Job key={index} job={job} isDashboard={isDashboard} />
      ))}
    </div>
  );
};

export default Jobs;
