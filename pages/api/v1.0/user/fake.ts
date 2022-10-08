import prisma from 'lib/server/database/prisma';
import { createUser, getUser } from 'lib/server/database/userManage';
import apiHandler from 'lib/server/apiHandler';
import {
  formatErrorCode,
  maximumValueErrorCode,
  minimumValueErrorCode,
  ParameterFormatError,
} from 'lib/exceptions/ParameterFormatError';
import { maximumFakeRecordNumber, minimumFakeRecordNumber } from 'lib/regexPattern';
import { faker } from '@faker-js/faker';
import { Role } from '@prisma/client';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiHandlerCallback } from 'lib/server/apiHandler';
import type { Session } from 'next-auth';

type UserFake = {
  name: string;
  email: string;
  username: string;
  imagePath: string;
  role: Role;
};

function createFakeUsers(userNumber: number) {
  const roleType = [Role.ADMIN, Role.COMPANY, Role.WORKER];
  let users: UserFake[] = [];
  if (isNaN(userNumber)) {
    throw new ParameterFormatError(`Parameter not correct: number ${userNumber}`, formatErrorCode);
  }
  if (userNumber < minimumFakeRecordNumber) {
    throw new ParameterFormatError(
      `Parameter not in range: userNumber ${userNumber}`,
      minimumValueErrorCode,
    );
  } else if (userNumber > maximumFakeRecordNumber) {
    throw new ParameterFormatError(
      `Parameter not in range: userNumber ${userNumber}`,
      maximumValueErrorCode,
    );
  }
  for (let count = 0; count < userNumber; count++) {
    users.push({
      name: faker.name.fullName(),
      email: faker.internet.email().toLowerCase(),
      username: faker.internet.userName().toLowerCase(),
      imagePath: faker.image.avatar(),
      role: roleType[Math.floor(Math.random() * roleType.length)],
    });
  }
  return users;
}

/**
 *  @swagger
 *  /api/v1.0/user/fake:
 *    post:
 *      description: Create `number` fake users. Only the user
 *                   with ADMIN role can send it.
 *      operationId: addFakeUsers
 *      parameters:
 *        - in: query
 *          name: number
 *          required: true
 *          schema:
 *            type: integer
 *            format: int32
 *            minimum: 1
 *            maximum: 1000
 *            default: 10
 *          description: Number of fake records to be created.
 *          example: 10
 *      responses:
 *        '201':
 *          description: The operation is performed correctly
 */
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
    case 'POST': {
      if (typeof req.body.number !== 'string') {
        throw new ParameterFormatError(
          `Parameter not correct: number ${req.body.number}`,
          formatErrorCode,
        );
      }
      const users = createFakeUsers(parseInt(req.body.number));
      if (users.length > 0) {
        await Promise.all(
          users.map((user) =>
            createUser(prisma, user.email, user.name, user.username, user.imagePath, user.role),
          ),
        );
      }
      res.status(201).end();
      return;
    }
  }
  return res.status(501).json({ message: 'Metod not implemented' });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
