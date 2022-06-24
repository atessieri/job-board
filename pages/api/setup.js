import prisma from 'lib/prisma';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (req.method !== 'POST') res.status(405).end();

  if (!session) return res.status(401).end();

  if (req.method === 'POST') {
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: req.body.name,
        company: req.body.company,
      },
    });
    res.status(200).end();
  }
}
