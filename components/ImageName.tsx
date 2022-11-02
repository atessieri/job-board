import { useGetUserQuery } from 'lib/client/redux/userSlice';
import Image from 'next/image';
import GrayMan from 'components/GrayMan';
import classnames from 'classnames';

export type ImageNameProps = {
  className?: string;
};

export default function ImageName({ className }: ImageNameProps) {
  const { currentData: user, isLoading, isError } = useGetUserQuery();
  const dataAvailable = isLoading === false && isError === false && typeof user !== 'undefined';
  return (
    <div className='flex items-center space-x-3'>
      <div className='flex rounded-full'>
        {dataAvailable && user.imagePath !== null ? (
          <Image src={user.imagePath} alt='' width='50' height='50' className='rounded-full' />
        ) : (
          <GrayMan className='h-10 w-10' />
        )}
      </div>
      {dataAvailable && (
        <span className={classnames(className, 'text-blue-800')}>
          {user.name ? user.name : user.email}
        </span>
      )}
    </div>
  );
}
