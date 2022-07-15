import prisma from 'lib/prisma';
import { getSession } from 'next-auth/react';
import { createJob, getUser } from 'lib/data';
import { Role } from '@prisma/client';

export default async function handler(req, res) {
  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Not logged in' });
    }
    const user = await getUser(prisma, session.user.id);
    if (user.role !== Role.COMPANY) {
      return res.status(405).json({ message: 'Metod not allowed' });
    }
    switch (req.method) {
      case 'POST':
        if (!req.body.title) {
          return res.status(400).json({ message: 'Required parameter title missing' });
        }
        if (!req.body.description) {
          return res.status(400).json({ message: 'Required parameter description missing' });
        }
        if (!req.body.salary) {
          return res.status(400).json({ message: 'Required parameter salary missing' });
        }
        if (!req.body.location) {
          return res.status(400).json({ message: 'Required parameter location missing' });
        }
        if (!req.body.published) {
          return res.status(400).json({ message: 'Required parameter location missing' });
        }
        const result = await createJob(
          prisma,
          user.id,
          req.body.title,
          req.body.description,
          req.body.salary,
          req.body.location,
          req.body.published,
        );
        if (result.count === 0) {
          return res.status(404).json({ message: 'Relation not found' });
        }
        return res.status(201).end();
      default:
        return res.status(501).json({ message: 'Metod not implemented' });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal error' });
  }
}
