import prisma from 'lib/database/prisma';
import UserManage from 'lib/database/UserManage';
import apiHandler from 'lib/genericHandler';

import type { User } from 'lib/database/UserManage';
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
      if (typeof user === 'undefined') {
        return res.status(405).json({ message: 'Metod not allowed' });
      }
      return res.status(200).json(user);
    }
    case 'POST': {
      let user = await UserManage.getUser(prisma, session.user.id);
      if (typeof user === 'undefined' || user.role !== 'ADMIN') {
        return res.status(405).json({ message: 'Metod not allowed' });
      }
      user = {
        id: undefined,
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        imagePath: req.body.imagePath,
        role: req.body.role,
      };
      await UserManage.create(prisma, user);
      res.status(201).end();
      return;
    }
    case 'PUT': {
      const user: User = {
        id: session.user.id,
        name: req.body.name,
        email: undefined,
        username: req.body.username,
        imagePath: req.body.imagePath,
        role: req.body.role,
      };
      await UserManage.updateUser(prisma, user);
      res.status(200).end();
      return;
    }
  }
  return res.status(501).json({ message: 'Metod not implemented' });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
