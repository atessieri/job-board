function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function dataTimeConvert(dataTime: string) {
  const date = new Date(Date.parse(dataTime));
  return date.toLocaleDateString('it-IT');
}

export default function JobTable({ user, jobs, displayPublished }) {
  return (
    <div className='hidden sm:block sm:px-6 lg:px-8'>
      <div className='mx-8 mt-8 overflow-hidden shadow-lg ring-2 ring-black ring-opacity-5 rounded-lg'>
        <table className='table-auto min-w-full divide-y divide-gray-300'>
          <thead className='bg-gray-200'>
            <tr>
              <th scope='col' className='py-3.5 pl-4 pr-3 text-center text-md font-bold text-gray-900'>
                Title
              </th>
              <th scope='col' className='hidden px-3 py-3.5 text-center text-md font-bold text-gray-900 lg:table-cell'>
                Date
              </th>
              <th scope='col' className='hidden px-3 py-3.5 text-center text-md font-bold text-gray-900 sm:table-cell'>
                Author
              </th>
              <th scope='col' className='hidden px-3 py-3.5 text-center text-md font-bold text-gray-900 lg:table-cell'>
                Location
              </th>
              <th scope='col' className='hidden px-3 py-3.5 text-center text-md font-bold text-gray-900 md:table-cell'>
                Salary
              </th>
              {displayPublished && (
                <th
                  scope='col'
                  className='hidden px-3 py-3.5 text-center text-md font-bold text-gray-900 sm:table-cell'
                >
                  Published
                </th>
              )}
              <th scope='col' className='hidden px-3 py-3.5 text-center text-md font-bold text-gray-900 sm:table-cell'>
                Applications
              </th>
              <th scope='col' className='relative py-3.5 pl-3 pr-4'>
                <span className='sr-only'>Edit</span>
              </th>
              <th scope='col' className='relative py-3.5 pl-3 pr-4'>
                <span className='sr-only'>Delete</span>
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white'>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className='py-4 pl-4 pr-3 text-left text-sm font-medium text-gray-900'>{job.title}</td>
                <td className='hidden whitespace-nowrap px-3 py-4 text-left text-sm text-gray-700 lg:table-cell'>
                  {dataTimeConvert(job.createdAt)}
                </td>
                <td className='hidden whitespace-nowrap px-3 py-4 text-left text-sm text-gray-700 sm:table-cell'>
                  {job.author.name ? job.author.name : job.author.email}
                </td>
                <td className='hidden whitespace-nowrap px-3 py-4 text-left text-sm text-gray-700 lg:table-cell'>
                  {job.location}
                </td>
                <td className='hidden whitespace-nowrap px-3 py-4 text-right text-sm text-gray-700 md:table-cell'>
                  {job.salary + '\u20AC'}
                </td>
                {displayPublished && (
                  <td className='hidden whitespace-nowrap px-3 py-4 text-center text-sm text-gray-700 sm:table-cell'>
                    {job.published ? 'true' : 'false'}
                  </td>
                )}
                <td className='hidden whitespace-nowrap px-3 py-4 text-right text-sm text-gray-700 sm:table-cell'>
                  {job._count.application}
                </td>
                <td className='py-4 pl-3 pr-4 text-right text-sm font-medium'>Edit</td>
                <td className='py-4 pl-3 pr-4 text-right text-sm font-medium'>Delete</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
