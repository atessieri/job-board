import prisma from 'lib/prisma';
import { getSession } from 'next-auth/react';
import { getApplication, getUser, updateApplication, deleteApplication } from 'lib/data';
import { Role } from '@prisma/client';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET': {
        const session = await getSession({ req });
        if (!session) {
          return res.status(401).json({ message: 'Not logged in' });
        }
        const user = await getUser(prisma, session.user.id);
        if (user.role !== Role.WORKER) {
          return res.status(405).json({ message: 'Metod not allowed' });
        }
        return res.status(200).json(await getApplication(prisma, session.user.id, parseInt(req.query.id)));
      }
      case 'PUT': {
        const session = await getSession({ req });
        if (!session) {
          return res.status(401).json({ message: 'Not logged in' });
        }
        const user = await getUser(prisma, session.user.id);
        if (user.role !== Role.WORKER) {
          return res.status(405).json({ message: 'Metod not allowed' });
        }
        const result = await updateApplication(prisma, session.user.id, parseInt(req.query.id), req.body.coverLetter);
        if (result.count === 0) {
          return res.status(404).json({ message: 'Relation not found' });
        }
        return res.status(200).end();
      }
      case 'DELETE': {
        const session = await getSession({ req });
        if (!session) {
          return res.status(401).json({ message: 'Not logged in' });
        }
        const user = await getUser(prisma, session.user.id);
        if (user.role !== Role.WORKER) {
          return res.status(405).json({ message: 'Metod not allowed' });
        }
        const result = await deleteApplication(prisma, session.user.id, parseInt(req.query.id));
        if (result.count === 0) {
          return res.status(204).end();
        }
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
