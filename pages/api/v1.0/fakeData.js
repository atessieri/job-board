import prisma from 'lib/prisma';
import { getSession } from 'next-auth/react';
import { faker } from '@faker-js/faker';
import {
  getUser,
  createUsers,
  cleanDatabase,
  getUsersRole,
  createJob,
  getJobs,
  createApplication,
  getJobWithApplication,
} from 'lib/data';
import { Role } from '@prisma/client';

async function createFakeUsers(userNumber) {
  let users = [];
  for (let count = 0; count < userNumber; count++) {
    let role;
    switch (Math.floor(Math.random() * 3)) {
      case 0:
        role = Role.ADMIN;
        break;
      case 1:
        role = Role.COMPANY;
        break;
      case 2:
      default:
        role = Role.WORKER;
        break;
    }
    users.push({
      name: faker.name.findName(),
      username: faker.internet.userName().toLowerCase(),
      email: faker.internet.email().toLowerCase(),
      role,
      image: faker.image.avatar(),
    });
  }
  await createUsers(prisma, users);
}

async function createFakeJobs(jobNumber) {
  const userCompany = await getUsersRole(prisma, Role.COMPANY, jobNumber);
  if (userCompany.length) {
    await Promise.all(
      userCompany.map(async (user) => {
        await createJob(
          prisma,
          user.id,
          faker.company.catchPhrase(),
          faker.lorem.paragraphs(),
          faker.commerce.price(1000, 6000),
          faker.address.cityName(),
          Math.random() < 0.5 ? false : true,
        );
      }),
    );
  }
}

async function createFakeApplications(applicationNumber) {
  const userWorker = await getUsersRole(prisma, Role.WORKER, applicationNumber);
  const jobs = await getJobs(prisma, true, undefined, 10);
  if (jobs.length && userWorker.length) {
    await Promise.all(
      jobs.map(async (job) => {
        const workerId = userWorker[Math.floor(Math.random() * userWorker.length)].id;
        const jobApplication = await getJobWithApplication(prisma, job.id, workerId);
        if (jobApplication.length === 0) {
          await createApplication(prisma, workerId, job.id, faker.lorem.paragraphs());
        }
      }),
    );
  }
}

export default async function handler(req, res) {
  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Not logged in' });
    }
    const user = await getUser(prisma, session.user.id);
    if (user.role !== Role.ADMIN) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    switch (req.method) {
      case 'POST': {
        let number;
        if (!req.body.operation) {
          return res.status(400).json({ message: 'Required operation missing' });
        }
        number = parseInt(req.body.number);
        if (isNaN(number)) {
          return res.status(400).json({ message: 'Required operation missing' });
        }
        switch (req.body.operation) {
          case 'users':
            await createFakeUsers(number);
            break;
          case 'jobs':
            await createFakeJobs(number);
            break;
          case 'applications':
            await createFakeApplications(number);
            break;
          default:
            return res.status(501).json({ message: 'Operation not implemented' });
        }
        return res.status(201).end();
      }
      case 'DELETE': {
        await cleanDatabase(prisma, session.user.id);
        return res.status(200).end();
      }
      default:
        return res.status(501).json({ message: 'Metod not implemented' });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal error' });
  }
}
