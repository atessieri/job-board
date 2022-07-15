import prisma from 'lib/prisma';
import { getJobs } from 'lib/data';
import { getSession } from 'next-auth/react';
import { getUser } from 'lib/data';
import { Role } from '@prisma/client';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'GET': {
        let onlyPublished = true;
        if (req.query.authorId) {
          const session = await getSession({ req });
          if (session) {
            const user = await getUser(prisma, session.user.id);
            if (user.role === Role.COMPANY && req.query.authorId === session.user.id) {
              onlyPublished = false;
            }
          }
        }
        return res
          .status(200)
          .json(
            await getJobs(
              prisma,
              onlyPublished,
              req.query.authorId,
              parseInt(req.query.take),
              parseInt(req.query.cursor),
            ),
          );
      }
      default:
        return res.status(501).json({ message: 'Metod not implemented' });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: 'Internal error' });
  }
}
