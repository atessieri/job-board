import prisma from 'lib/prisma';
import { getSession } from 'next-auth/react';
import { faker } from '@faker-js/faker';

const generateFakeJob = (user) => ({
  title: faker.company.catchPhrase(),
  description: faker.lorem.paragraphs(),
  author: {
    connect: { id: user.id },
  },
});

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (req.method !== 'POST') return res.status(405).end();

  if (!session) return res.status(401).end();

  if (req.body.task === 'clean_database') {
    await prisma.job.deleteMany({});
    await prisma.user.deleteMany({});
  } else if (req.body.task === 'generate_users_and_jobs') {
    let count = 0;

    while (count < 10) {
      await prisma.user.create({
        data: {
          name: faker.internet.userName().toLowerCase(),
          email: faker.internet.email().toLowerCase(),
          company: faker.datatype.boolean(),
        },
      });
      count++;
    }

    //create 1 job for each user that's a company
    const users = await prisma.user.findMany({
      where: {
        company: true,
      },
    });

    users.forEach(async (user) => {
      await prisma.job.create({
        data: generateFakeJob(user),
      });
    });
  } else if (req.body.task === 'generate_one_job') {
    const users = await prisma.user.findMany({
      where: {
        company: true,
      },
    });

    await prisma.job.create({
      data: generateFakeJob(users[0]),
    });
  } else {
    res.status(400).end();
  }

  res.status(200).end();
}
