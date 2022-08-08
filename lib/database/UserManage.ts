import prisma from 'lib/database/prisma';
import User from 'lib/database/User';
import ParameterFormatError from 'lib/exceptions/ParameterFormatError';

import { Prisma, PrismaClient } from '@prisma/client';

import type { Role } from '@prisma/client';

export default class UserManage {
  private static _prisma: PrismaClient = prisma;

  public static async create(user: User) {
    if (typeof user.email === 'undefined' || user.email === null) {
      throw new ParameterFormatError('Email not correct');
    }
    let data: Prisma.UserCreateInput = {
      email: user.email,
    };
    if (typeof user.name !== 'undefined') {
      data.name = user.name;
    }
    if (typeof user.username !== 'undefined') {
      data.username = user.username;
    }
    if (typeof user.imagePath !== 'undefined') {
      data.imagePath = user.imagePath;
    }
    if (user.role !== null) {
      data.role = user.role;
    }
    await this._prisma.user.create({
      data,
    });
  }

  public static async getUser(userId: string) {
    const result = await this._prisma.user.findUnique({
      where: {
        id: userId,
      },
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
    });
    if (result === null) {
      return null;
    }
    return new User(
      result.id,
      result.name,
      result.email,
      result.username,
      result.imagePath,
      result.role,
      result.createdAt,
      result.updatedAt,
    );
  }

  public static async updateUser(user: User) {
    if (typeof user.id === 'undefined' || user.id === null) {
      throw new ParameterFormatError('Identifier not correct');
    }
    let updateField: boolean = false;
    const data: Prisma.UserUpdateInput = {};
    if (typeof user.name !== 'undefined') {
      data.name = user.name;
      updateField = true;
    }
    if (typeof user.email !== 'undefined' && user.email !== null) {
      data.email = user.email;
      updateField = true;
    }
    if (typeof user.username !== 'undefined') {
      data.username = user.username;
      updateField = true;
    }
    if (typeof user.imagePath !== 'undefined') {
      data.imagePath = user.imagePath;
      updateField = true;
    }
    if (typeof user.role !== 'undefined' && user.role !== null) {
      data.role = user.role;
      updateField = true;
    }
    if (!updateField) {
      return;
    }
    await this._prisma.user.update({
      data,
      where: {
        id: user.id,
      },
    });
  }

  public static async getUsers(take?: number, cursor?: string) {
    const query: Prisma.UserFindManyArgs = {
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
        id: 'asc',
      },
    };
    if (typeof take !== 'undefined' && !isNaN(take)) {
      query.take = take;
    } else {
      query.take = 10;
    }
    if (cursor) {
      query.cursor = { id: cursor };
      query.skip = 1;
    }
    const queryResult = await this._prisma.user.findMany(query);
    let result: User[] = [];
    queryResult.forEach((user) => {
      result.push(
        new User(
          user.id,
          user.name,
          user.email,
          user.username,
          user.imagePath,
          user.role,
          user.createdAt,
          user.updatedAt,
        ),
      );
    });
    return result;
  }

  public static async getUsersRole(role: Role, take?: number, cursor?: string) {
    const query: Prisma.UserFindManyArgs = {
      where: {
        role,
      },
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
        id: 'asc',
      },
    };
    if (typeof take !== 'undefined' && !isNaN(take)) {
      query.take = take;
    } else {
      query.take = 10;
    }
    if (cursor) {
      query.cursor = { id: cursor };
      query.skip = 1;
    }
    const queryResult = await this._prisma.user.findMany(query);
    let result: User[] = [];
    queryResult.forEach((user) => {
      result.push(
        new User(
          user.id,
          user.name,
          user.email,
          user.username,
          user.imagePath,
          user.role,
          user.createdAt,
          user.updatedAt,
        ),
      );
    });
    return result;
  }

  public static async deleteUser(userId: string) {
    await this._prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }
}
