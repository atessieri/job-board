import CustomError from 'lib/exceptions/CustomError';
import { Prisma } from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from 'next-auth';
import { authOptions } from 'pages/api/auth/[...nextauth]';

export type ApiHandlerCallback = (req: NextApiRequest, res: NextApiResponse, session: Session | null) => Promise<void>;

export default async function apiHandler(req: NextApiRequest, res: NextApiResponse, callback: ApiHandlerCallback) {
  try {
    const session = await unstable_getServerSession(req, res, authOptions);
    return await callback(req, res, session);
  } catch (error) {
    if (error instanceof CustomError) {
      console.log(`Error ${error.name} code ${error.errorCode}: ${error.message}`);
      return res.status(400).json({ message: 'Parameter format error' });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(`Error ${error.name} code ${error.code}: ${error.message}`);
      return res.status(500).json({ message: 'Internal error' });
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
      console.log(`Error ${error.name} code ${error.errorCode}: ${error.message}`);
      return res.status(500).json({ message: 'Internal error' });
    } else if (
      error instanceof Prisma.PrismaClientUnknownRequestError ||
      error instanceof Prisma.PrismaClientRustPanicError ||
      error instanceof Error
    ) {
      console.log(`Error ${error.name}: ${error.message}`);
      return res.status(500).json({ message: 'Internal error' });
    }
  }
}
