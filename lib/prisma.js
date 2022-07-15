import { PrismaClient } from '@prisma/client';
import { fieldEncryptionMiddleware } from 'prisma-field-encryption';

function prismaClientFactory(tracerEnabler = false) {
  const prisma = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'info',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  });

  if (tracerEnabler) {
    prisma.$on('query', (e) => {
      console.log('Query: ' + e.query);
      console.log('Params: ' + e.params);
      console.log('Duration: ' + e.duration + 'ms');
    });
  }
  prisma.$use(fieldEncryptionMiddleware());
  return prisma;
}

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = prismaClientFactory(false);
} else {
  if (!global.prisma) {
    global.prisma = prismaClientFactory(true);
  }
  prisma = global.prisma;
}

export default prisma;
