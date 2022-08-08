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
  switch (req.method) {
    case 'GET': {
      const user = await UserManage.getUser(session.user.id);
      if (user === null) {
        return res.status(405).json({ message: 'Metod not allowed' });
      }
      return res.status(200).json(user);
    }
    case 'POST': {
      let user = await UserManage.getUser(session.user.id);
      if (user === null || user.role !== 'ADMIN') {
        return res.status(405).json({ message: 'Metod not allowed' });
      }
      user = new User(undefined, req.body.name, req.body.email, req.body.username, req.body.imagePath, req.body.role);
      await UserManage.create(user);
      res.status(201).end();
      return;
    }
    case 'PUT': {
      const user = new User(
        session.user.id,
        req.body.name,
        undefined,
        req.body.username,
        req.body.imagePath,
        req.body.role,
      );
      await UserManage.updateUser(user);
      res.status(200).end();
      return;
    }
  }
  return res.status(501).json({ message: 'Metod not implemented' });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
