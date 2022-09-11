import apiHandler from 'lib/genericHandler';
import prisma from 'lib/database/prisma';
import UserManage from 'lib/database/UserManage';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiHandlerCallback } from 'lib/genericHandler';
import type { Session } from 'next-auth';

const callbackHandler: ApiHandlerCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null,
) => {
  if (!session) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  switch (req.method) {
    case 'GET': {
      const user = await UserManage.getUser(prisma, session.user.id);
      if (typeof user === 'undefined' || user.role !== 'ADMIN') {
        return res.status(405).json({ message: 'Metod not allowed' });
      }
      const users = await UserManage.getUsers(
        prisma,
        typeof req.query.take === 'string' ? parseInt(req.query.take) : undefined,
        typeof req.query.cursor === 'string' ? req.query.cursor : undefined,
      );
      return res.status(200).json(users);
    }
  }
  return res.status(501).json({ message: 'Metod not implemented' });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
