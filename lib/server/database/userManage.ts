import { ParameterFormatError, formatErrorCode } from 'lib/exceptions/ParameterFormatError';
import { patternEmail, patternNameSurname, patternUrl, patternUsername } from 'lib/regexPattern';
import { PrismaClient } from '@prisma/client';

import type { Role } from '@prisma/client';

export type UserType = {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  imagePath: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

export async function createUser(
  prisma: PrismaClient,
  email: string,
  name?: string | null,
  username?: string | null,
  imagePath?: string | null,
  role?: Role,
) {
  if (typeof name === 'string' && !patternNameSurname.test(name)) {
    throw new ParameterFormatError(`Parameter not correct: name ${name}`, formatErrorCode);
  }
  if (!patternEmail.test(email)) {
    throw new ParameterFormatError(`Parameter not correct: email ${email}`, formatErrorCode);
  }
  if (typeof username === 'string' && !patternUsername.test(username)) {
    throw new ParameterFormatError(`Parameter not correct: username ${username}`, formatErrorCode);
  }
  if (typeof imagePath === 'string' && !patternUrl.test(imagePath)) {
    throw new ParameterFormatError(
      `Parameter not correct: imagePath ${imagePath}`,
      formatErrorCode,
    );
  }
  const queryResult = await prisma.user.create({
    data: {
      name,
      email,
      username,
      imagePath,
      role,
    },
  });
  return {
    id: queryResult.id,
    name: queryResult.name,
    email: queryResult.email,
    username: queryResult.username,
    imagePath: queryResult.imagePath,
    role: queryResult.role,
    createdAt: queryResult.createdAt.toISOString(),
    updatedAt: queryResult.updatedAt.toISOString(),
  } as UserType;
}

export async function getUser(prisma: PrismaClient, userId: string) {
  const queryResult = await prisma.user.findUnique({
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      imagePath: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      id: userId,
    },
  });
  if (queryResult === null) {
    return undefined;
  }
  return {
    id: queryResult.id,
    name: queryResult.name,
    email: queryResult.email,
    username: queryResult.username,
    imagePath: queryResult.imagePath,
    role: queryResult.role,
    createdAt: queryResult.createdAt.toISOString(),
    updatedAt: queryResult.updatedAt.toISOString(),
  } as UserType;
}

export async function updateUser(
  prisma: PrismaClient,
  userId: string,
  name?: string | null,
  email?: string,
  username?: string | null,
  imagePath?: string | null,
  role?: Role,
) {
  if (typeof name === 'string' && !patternNameSurname.test(name)) {
    throw new ParameterFormatError(`Parameter not correct: name ${name}`, formatErrorCode);
  }
  if (typeof email === 'string' && !patternEmail.test(email)) {
    throw new ParameterFormatError(`Parameter not correct: email ${email}`, formatErrorCode);
  }
  if (typeof username === 'string' && !patternUsername.test(username)) {
    throw new ParameterFormatError(`Parameter not correct: username ${username}`, formatErrorCode);
  }
  if (typeof imagePath === 'string' && !patternUrl.test(imagePath)) {
    throw new ParameterFormatError(
      `Parameter not correct: imagePath ${imagePath}`,
      formatErrorCode,
    );
  }
  const queryResult = await prisma.user.update({
    data: {
      name,
      email,
      username,
      imagePath,
      role,
    },
    where: {
      id: userId,
    },
  });
  return {
    id: queryResult.id,
    name: queryResult.name,
    email: queryResult.email,
    username: queryResult.username,
    imagePath: queryResult.imagePath,
    role: queryResult.role,
    createdAt: queryResult.createdAt.toISOString(),
    updatedAt: queryResult.updatedAt.toISOString(),
  } as UserType;
}

export async function getUsers(prisma: PrismaClient, take?: number, cursor?: string) {
  const queryResult = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      imagePath: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      id: 'desc',
    },
    take: typeof take !== 'undefined' && !isNaN(take) ? take : 10,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : undefined,
  });
  return queryResult.map((user) => {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      imagePath: user.imagePath,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }) as UserType[];
}

export async function getUsersRole(
  prisma: PrismaClient,
  role: Role,
  take?: number,
  cursor?: string,
) {
  const queryResult = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      imagePath: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    where: {
      role,
    },
    orderBy: {
      id: 'desc',
    },
    take: typeof take !== 'undefined' && !isNaN(take) ? take : 10,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : undefined,
  });
  return queryResult.map((user) => {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      imagePath: user.imagePath,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }) as UserType[];
}

export async function deleteUser(prisma: PrismaClient, userId: string) {
  await prisma.user.delete({
    where: {
      id: userId,
    },
  });
}
