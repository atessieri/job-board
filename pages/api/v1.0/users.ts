import apiHandler from 'lib/server/apiHandler';
import prisma from 'lib/server/database/prisma';
import { getUser, getUsers } from 'lib/server/database/userManage';
import { Role } from '@prisma/client';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiHandlerCallback } from 'lib/server/apiHandler';
import type { Session } from 'next-auth';

const callbackHandler: ApiHandlerCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null,
) => {
  if (!session) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  const user = await getUser(prisma, session.user.id);
  if (typeof user === 'undefined' || user.role !== Role.ADMIN) {
    return res.status(405).json({ message: 'Metod not allowed' });
  }
  switch (req.method) {
    case 'GET': {
      const users = await getUsers(
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
