import apiHandler from 'lib/apiHandler';
import User from 'lib/database/User';
import UserManage from 'lib/database/UserManage';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiHandlerCallback } from 'lib/apiHandler';
import type { Session } from 'next-auth';

const callbackHandler: ApiHandlerCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null,
) => {
  if (!session) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  const userSession = await UserManage.getUser(session.user.id);
  if (userSession === null || userSession.role !== 'ADMIN') {
    return res.status(405).json({ message: 'Metod not allowed' });
  }
  switch (req.method) {
    case 'GET': {
      if (typeof req.query.id !== 'string') {
        return res.status(400).json({ message: 'Parameter format error' });
      }
      const user = await UserManage.getUser(req.query.id);
      if (user === null) {
        return res.status(400).json({ message: 'User not found' });
      }
      return res.status(200).json(user);
    }
    case 'PUT': {
      if (typeof req.query.id !== 'string') {
        return res.status(400).json({ message: 'Parameter format error' });
      }
      const user = new User(
        req.query.id,
        req.body.name,
        req.body.email,
        req.body.username,
        req.body.imagePath,
        req.body.role,
      );
      await UserManage.updateUser(user);
      res.status(200).end();
      return;
    }
    case 'DELETE': {
      if (typeof req.query.id !== 'string') {
        return res.status(400).json({ message: 'Parameter format error' });
      }
      await UserManage.deleteUser(req.query.id);
      res.status(200).end();
      return;
    }
  }
  return res.status(501).json({ message: 'Metod not implemented' });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
