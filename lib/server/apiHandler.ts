import { CustomError } from 'lib/exceptions/CustomError';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from 'pages/api/auth/[...nextauth]';
import { Prisma } from '@prisma/client';
import { ParameterFormatError } from 'lib/exceptions/ParameterFormatError';

import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from 'next-auth';
import type { GetServerSidePropsContext } from 'next';

export type ApiHandlerCallback = (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null,
) => Promise<void>;

export default async function apiHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  callback: ApiHandlerCallback,
) {
  try {
    const session = await unstable_getServerSession(req, res, authOptions);
    return await callback(req, res, session);
  } catch (error) {
    if (error instanceof ParameterFormatError) {
      console.log(`Error ${error.name} code ${error.errorCode}: ${error.message}`);
      return res.status(400).json({ message: error.message });
    } else if (error instanceof CustomError) {
      console.log(`Error ${error.name} code ${error.errorCode}: ${error.message}`);
      return res.status(500).json({ message: 'Internal error' });
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

export type Props<DataType> = {
  data?: DataType;
  errorInfo: {
    errorHappen: boolean;
    errorCode: number;
    errorMessage?: string;
  };
};

export type ServerSidePropsCallback<DataType> = (
  context: GetServerSidePropsContext,
  session: Session | null,
) => Promise<DataType>;

export async function genericServerSideProps<DataType>(
  context: GetServerSidePropsContext,
  callback: ServerSidePropsCallback<DataType>,
) {
  try {
    const session = await unstable_getServerSession(context.req, context.res, authOptions);
    return {
      props: {
        data: await callback(context, session),
        errorInfo: {
          errorHappen: false,
          errorCode: 200,
        },
      },
    };
  } catch (error) {
    let props: Props<DataType> = {
      errorInfo: {
        errorHappen: false,
        errorCode: 200,
      },
    };
    if (error instanceof ParameterFormatError) {
      console.log(`Error ${error.name} code ${error.errorCode}: ${error.message}`);
      props.errorInfo = {
        errorHappen: true,
        errorCode: 400,
        errorMessage: error.message,
      };
    } else if (error instanceof CustomError) {
      console.log(`Error ${error.name} code ${error.errorCode}: ${error.message}`);
      props.errorInfo = {
        errorHappen: true,
        errorCode: 500,
        errorMessage: 'Internal error',
      };
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(`Error ${error.name} code ${error.code}: ${error.message}`);
      props.errorInfo = {
        errorHappen: true,
        errorCode: 500,
        errorMessage: 'Internal error',
      };
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
      console.log(`Error ${error.name} code ${error.errorCode}: ${error.message}`);
      props.errorInfo = {
        errorHappen: true,
        errorCode: 500,
        errorMessage: 'Internal error',
      };
    } else if (
      error instanceof Prisma.PrismaClientUnknownRequestError ||
      error instanceof Prisma.PrismaClientRustPanicError ||
      error instanceof Error
    ) {
      console.log(`Error ${error.name}: ${error.message}`);
      props.errorInfo = {
        errorHappen: true,
        errorCode: 500,
        errorMessage: 'Internal error',
      };
    }
    return { props };
  }
}
