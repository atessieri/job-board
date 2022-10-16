import prisma from 'lib/server/database/prisma';
import { deleteUser, getUser, updateUser } from 'lib/server/database/userManage';
import apiHandler from 'lib/server/apiHandler';
import {
  HttpError,
  metodNotAllowedErrorCode,
  metodNotImplementedErrorCode,
  noLoggedInErrorCode,
} from 'lib/exceptions/HttpError';
import { Role } from '@prisma/client';
import { formatErrorCode, ParameterFormatError } from 'lib/exceptions/ParameterFormatError';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiHandlerCallback } from 'lib/server/apiHandler';
import type { Session } from 'next-auth';

/**
 *  @swagger
 *  /api/v1.0/user/{id}:
 *    get:
 *      description: Return the information about the user
 *                   identified by a `id`. Only the user
 *                   with ADMIN role can send it.
 *      operationId: getUserWithId
 *      tags:
 *        - User management
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *          description: User identification
 *          example: 'cl5kt7g1005015nbfqoos7lgs'
 *      responses:
 *        '200':
 *          description: Return the information about the user
 *                       identified by a numeric `id`.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserType'
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
 *    put:
 *      description: Update the information of the user identified
 *                   by a `id`. Only the user with
 *                   ADMIN role can send it.
 *      operationId: updateUserWithId
 *      tags:
 *        - User management
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *          description: User identification
 *          example: 'cl5kt7g1005015nbfqoos7lgs'
 *      requestBody:
 *        description: The information to update the user
 *                     identified by a `id`.
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *               $ref: '#/components/schemas/UpdateUserType'
 *      responses:
 *        '200':
 *          description: The operation is performed correctly
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/UserType'
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
 *    delete:
 *      description: Remove the user identified by
 *                   a numeric `id`. Only the user
 *                   with ADMIN role can send it.
 *      operationId: deleteUserWithId
 *      tags:
 *        - User management
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          schema:
 *            type: string
 *          description: User identification
 *          example: 'cl5kt7g1005015nbfqoos7lgs'
 *      responses:
 *        '200':
 *          description: The operation is performed correctly
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
    throw new HttpError('Not logged in', noLoggedInErrorCode, 401);
  }
  const userSession = await getUser(prisma, session.user.id);
  if (typeof userSession === 'undefined' || userSession.role !== Role.ADMIN) {
    throw new HttpError('Metod not allowed', metodNotAllowedErrorCode, 405);
  }
  if (typeof req.query.id !== 'string') {
    throw new ParameterFormatError(
      `Parameter not correct: userId ${req.query.id}`,
      formatErrorCode,
    );
  }
  switch (req.method) {
    case 'GET': {
      const user = await getUser(prisma, req.query.id);
      if (typeof user === 'undefined') {
        throw new HttpError('User not found', noLoggedInErrorCode, 401);
      }
      return res.status(200).json(user);
    }
    case 'PUT': {
      const user = await updateUser(
        prisma,
        req.query.id,
        req.body.name,
        req.body.username,
        req.body.imagePath,
        req.body.role,
      );
      return res.status(200).json(user);
    }
    case 'DELETE': {
      await deleteUser(prisma, req.query.id);
      res.status(200).end();
      return;
    }
  }
  throw new HttpError('Metod not implemented', metodNotImplementedErrorCode, 501);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return apiHandler(req, res, callbackHandler);
}
