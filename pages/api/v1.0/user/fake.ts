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
import {
  HttpError,
  metodNotAllowedErrorCode,
  metodNotImplementedErrorCode,
  noLoggedInErrorCode,
} from 'lib/exceptions/HttpError';

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
    throw new ParameterFormatError(
      `Parameter not correct: number ${userNumber}`,
      formatErrorCode,
      new Error().stack,
    );
  }
  if (userNumber < minimumFakeRecordNumber) {
    throw new ParameterFormatError(
      `Parameter not in range: userNumber ${userNumber}`,
      minimumValueErrorCode,
      new Error().stack,
    );
  } else if (userNumber > maximumFakeRecordNumber) {
    throw new ParameterFormatError(
      `Parameter not in range: userNumber ${userNumber}`,
      maximumValueErrorCode,
      new Error().stack,
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
 *      tags:
 *        - Data management
 *      requestBody:
 *        description: Number of fake records to be created.
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - number
 *              properties:
 *                number:
 *                  type: integer
 *                  format: int32
 *                  minimum: 1
 *                  maximum: 1000
 *                  default: 10
 *                  example: 10
 *      responses:
 *        '201':
 *          description: The operation is performed correctly
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - number
 *                properties:
 *                  number:
 *                    type: integer
 *                    format: int32
 *                    example: 10
 *        '400':
 *          description: The parameter error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApiErrorReply'
 *        '401':
 *          description: No any login has been performed
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApiErrorReply'
 *        '405':
 *          description: The function cannot be used with current access rights
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApiErrorReply'
 *        '500':
 *          description: Internal error
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApiErrorReply'
 *        '501':
 *          description: The function isn't implemented
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/ApiErrorReply'
 */
const callbackHandler: ApiHandlerCallback = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null,
) => {
  if (!session) {
    throw new HttpError('Not logged in', noLoggedInErrorCode, 401, new Error().stack);
  }
  const user = await getUser(prisma, session.user.id);
  if (typeof user === 'undefined' || user.role !== Role.ADMIN) {
    throw new HttpError('Metod not allowed', metodNotAllowedErrorCode, 405, new Error().stack);
  }
  switch (req.method) {
    case 'POST': {
      if (typeof req.body.number !== 'number') {
        throw new ParameterFormatError(
          `Parameter not correct: number ${req.body.number}`,
          formatErrorCode,
          new Error().stack,
        );
      }
      const users = createFakeUsers(req.body.number);
      if (users.length > 0) {
        await Promise.all(
          users.map((user) =>
            createUser(prisma, user.email, user.name, user.username, user.imagePath, user.role),
          ),
        );
      }
      return res.status(201).json({
        number: users.length,
      });
    }
  }
  throw new HttpError(
    'Metod not implemented',
    metodNotImplementedErrorCode,
    501,
    new Error().stack,
  );
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return await apiHandler(req, res, callbackHandler);
}
