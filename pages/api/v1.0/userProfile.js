import prisma from 'lib/prisma';
import { getSession } from 'next-auth/react';
import { updateUser } from 'lib/data';

export default async function handler(req, res) {
  try {
    switch (req.method) {
      case 'PUT': {
        const session = await getSession({ req });
        if (!session) {
          return res.status(401).json({ message: 'Not logged in' });
        }
        const result = await updateUser(
          prisma,
          session.user.id,
          req.body.name,
          req.body.username,
          req.body.role,
          req.body.image,
        );
        if (result.count === 0) {
          return res.status(404).json({ message: 'Relation not found' });
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
