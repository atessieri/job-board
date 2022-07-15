import ProfileForm from 'components/ProfileForm';
import PageLayout from 'components/PageLayout';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import prisma from 'lib/prisma';
import { getUser } from 'lib/data';

export default function Profile({ user }) {
  const router = useRouter();
  if (!user) {
    router.push('/');
    return null;
  }
  const userNav = {
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.image,
  };
  return (
    <PageLayout currentPage={'Profile'} user={userNav}>
      <ProfileForm user={user} />
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
  } catch (error) {
    console.log(error.message);
    props = {};
  }
  return { props };
}
