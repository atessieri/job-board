import Link from 'next/link';
import Image from 'next/image';

const logo: string = '/logo.png';

export default function Logo() {
  return (
    <div className='block rounded-full'>
      <Link href='/' className='hover:border-gray-300'>
        <a>
          <Image src={logo} alt='Logo Job Board' width='50' height='50' />
        </a>
      </Link>
    </div>
  );
}
