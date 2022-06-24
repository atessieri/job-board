import prisma from 'lib/prisma';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).end();
  }

  const session = await getSession({ req });

  if (!session) return res.status(401).json({ message: 'Not logged in' });

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) return res.status(401).json({ message: 'User not found' });

  if (req.method === 'POST') {
    if (!req.body.title) return res.status(400).json({ message: 'Required parameter title missing' });
    if (!req.body.description) return res.status(400).json({ message: 'Required parameter description missing' });
    if (!req.body.location) return res.status(400).json({ message: 'Required parameter location missing' });
    if (!req.body.salary) return res.status(400).json({ message: 'Required parameter salary missing' });

    await prisma.job.create({
      data: {
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        salary: req.body.salary,
        author: {
          connect: { id: user.id },
        },
      },
    });

    return res.status(200).end();
  } else if (req.method === 'PUT') {
    const job = await prisma.job.findUnique({
      where: {
        id: parseInt(req.body.id),
      },
    });

    if (job.authorId !== user.id) {
      res.status(401).json({ message: 'Not authorized to edit' });
    }

    if (req.body.task === 'publish') {
      await prisma.job.update({
        where: {
          id: parseInt(req.body.id),
        },
        data: {
          published: true,
        },
      });
    }

    if (req.body.task === 'unpublish') {
      await prisma.job.update({
        where: {
          id: parseInt(req.body.id),
        },
        data: {
          published: false,
        },
      });
    }

    return res.status(200).end();
  }
}
