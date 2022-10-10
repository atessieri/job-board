import { CustomError } from 'lib/exceptions/CustomError';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from 'pages/api/auth/[...nextauth]';
import { Prisma } from '@prisma/client';
import { ParameterFormatError } from 'lib/exceptions/ParameterFormatError';
import { HttpError } from 'lib/exceptions/HttpError';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from 'next-auth';

export type ApiHandlerCallback = (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null,
) => Promise<void>;

type ApiErrorReply = {
  message: string;
  name?: string;
  errorCode?: string;
};

export default async function apiHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  callback: ApiHandlerCallback,
) {
  try {
    const session = await unstable_getServerSession(req, res, authOptions);
    return await callback(req, res, session);
  } catch (error) {
    if (error instanceof HttpError) {
      console.log(`Error ${error.name} code ${error.errorCode}: ${error.message}`);
      return res.status(error.httpErrorCode).json({
        message: error.message,
        name: error.name,
        errorCode: error.errorCode,
      } as ApiErrorReply);
    } else if (error instanceof ParameterFormatError) {
      console.log(`Error ${error.name} code ${error.errorCode}: ${error.message}`);
      return res.status(400).json({
        message: error.message,
        name: error.name,
        errorCode: error.errorCode,
      } as ApiErrorReply);
    } else if (error instanceof CustomError) {
      console.log(`Error ${error.name} code ${error.errorCode}: ${error.message}`);
      return res.status(500).json({
        message: error.message,
        name: error.name,
        errorCode: error.errorCode,
      } as ApiErrorReply);
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(`Error ${error.name} code ${error.code}: ${error.message}`);
      return res.status(500).json({
        message: error.message,
        name: error.name,
        errorCode: error.code,
      } as ApiErrorReply);
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
      console.log(`Error ${error.name} code ${error.errorCode}: ${error.message}`);
      return res.status(500).json({
        message: error.message,
        name: error.name,
        errorCode: error.errorCode,
      } as ApiErrorReply);
    } else if (
      error instanceof Prisma.PrismaClientUnknownRequestError ||
      error instanceof Prisma.PrismaClientRustPanicError ||
      error instanceof Error
    ) {
      console.log(`Error ${error.name}: ${error.message}`);
      return res.status(500).json({
        message: error.message,
        name: error.name,
      } as ApiErrorReply);
    }
  }
}
