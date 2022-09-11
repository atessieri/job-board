import ParameterFormatError from 'lib/exceptions/ParameterFormatError';
import { patternEmail, patternNameSurname, patternUrl, patternUsername } from 'lib/regexPattern';

import { PrismaClient } from '@prisma/client';

import type { Role } from '@prisma/client';

export type User = {
  id?: string;
  name?: string | null;
  email?: string;
  username?: string | null;
  imagePath?: string | null;
  role?: Role;
  createdAt?: string;
  updatedAt?: string;
};

export default class UserManage {
  public static async create(prisma: PrismaClient, user: User) {
    if (typeof user.name === 'string' && !patternNameSurname.test(user.name)) {
      throw new ParameterFormatError(`Name not correct: name ${user.name}`);
    }
    if (typeof user.email === 'undefined' || !patternEmail.test(user.email)) {
      throw new ParameterFormatError(`Email not correct: email ${user.email}`);
    }
    if (typeof user.username === 'string' && !patternUsername.test(user.username)) {
      throw new ParameterFormatError(`Username not correct: username ${user.username}`);
    }
    if (typeof user.imagePath === 'string' && !patternUrl.test(user.imagePath)) {
      throw new ParameterFormatError(`Image path not correct: imagePath ${user.imagePath}`);
    }
    const queryResult = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        username: user.username,
        imagePath: user.imagePath,
        role: user.role,
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
    } as User;
  }

  public static async getUser(prisma: PrismaClient, userId: string) {
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
    } as User;
  }

  public static async updateUser(prisma: PrismaClient, user: User) {
    if (typeof user.id === 'undefined') {
      throw new ParameterFormatError(`Identifier not correct: id ${user.id}`);
    }
    if (typeof user.name === 'string' && !patternNameSurname.test(user.name)) {
      throw new ParameterFormatError(`Name not correct: name ${user.name}`);
    }
    if (typeof user.email === 'string' && !patternEmail.test(user.email)) {
      throw new ParameterFormatError(`Email not correct: email ${user.email}`);
    }
    if (typeof user.username === 'string' && !patternUsername.test(user.username)) {
      throw new ParameterFormatError(`Username not correct: username ${user.username}`);
    }
    if (typeof user.imagePath === 'string' && !patternUrl.test(user.imagePath)) {
      throw new ParameterFormatError(`Image path not correct: imagePath ${user.imagePath}`);
    }
    const queryResult = await prisma.user.update({
      data: {
        name: user.name,
        email: user.email !== null ? user.email : undefined,
        username: user.username,
        imagePath: user.imagePath,
        role: user.role !== null ? user.role : undefined,
      },
      where: {
        id: user.id,
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
    } as User;
  }

  public static async getUsers(prisma: PrismaClient, take?: number, cursor?: string) {
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
    }) as User[];
  }

  public static async getUsersRole(prisma: PrismaClient, role: Role, take?: number, cursor?: string) {
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
    }) as User[];
  }

  public static async deleteUser(prisma: PrismaClient, userId: string) {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }
}
