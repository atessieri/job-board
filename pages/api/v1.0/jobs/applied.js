import prisma from 'lib/prisma';
import { getSession } from 'next-auth/react';
import { getUserAppliedJobs, getUser } from 'lib/data';
import { Role } from '@prisma/client';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET':
        const session = await getSession({ req });
        if (!session) {
          return res.status(401).json({ message: 'Not logged in' });
        }
        const user = await getUser(prisma, session.user.id);
        if (user.role !== Role.WORKER) {
          return res.status(405).json({ message: 'Metod not allowed' });
        }
        return res
          .status(200)
          .json(
            await getUserAppliedJobs(prisma, session.user.id, parseInt(req.query.take), parseInt(req.query.cursor)),
          );
      default:
        return res.status(501).json({ message: 'Metod not implemented' });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal error' });
  }
}
