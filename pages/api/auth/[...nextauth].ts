import EmailProvider from 'next-auth/providers/email';
import NextAuth from 'next-auth';
import prisma from 'lib/server/database/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],

  secret: process.env.SECRET,

  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  debug: false,

  callbacks: {
    session: async ({ session, token, user }) => {
      session.user.id = user.id;
      return Promise.resolve(session);
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, authOptions);
}
