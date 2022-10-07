import {
  ParameterFormatError,
  formatErrorCode,
  minimumValueErrorCode,
  maximumValueErrorCode,
} from 'lib/exceptions/ParameterFormatError';
import {
  maximumTakeRecordNumber,
  minimumTakeRecordNumber,
  patternEmail,
  patternNameSurname,
  patternUrl,
  patternUsername,
} from 'lib/regexPattern';
import { PrismaClient } from '@prisma/client';

import type { Role } from '@prisma/client';

/**
 *  @swagger
 *  components:
 *    schemas:
 *      Role:
 *        description: The role of the user
 *        type: string
 *        enum:
 *          - ADMIN
 *          - COMPANY
 *          - WORKER
 *        default: WORKER
 *        example: WORKER
 *      UserType:
 *        description: Information about the user
 *        type: object
 *        required:
 *          - id
 *          - name
 *          - email
 *          - username
 *          - imagePath
 *          - role
 *          - createdAt
 *          - updatedAt
 *        properties:
 *          id:
 *            description: The identification of the user
 *            type: string
 *            example: 'cl5kt7g1005015nbfqoos7lgs'
 *          name:
 *            description: Name and surname of the user
 *            type: string
 *            pattern: '^[a-zA-Z0-9\s]{1,}$'
 *            nullable: true
 *            example: 'John Doe'
 *          email:
 *            description: E-mail of the user used to authenticate it. It is unique
 *            type: string
 *            pattern: '^[\w\-\.]+@([\w-]+\.)+[\w-]{2,4}$'
 *            example: 'john.doe@example.com'
 *          username:
 *            description: Username of the user
 *            type: string
 *            pattern: '^[a-zA-Z0-9.]{1,}$'
 *            nullable: true
 *            example: 'j.doe'
 *          imagePath:
 *            description: Path of the user picture
 *            type: string
 *            pattern: '^(\b(https?|ftp|file)://)[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]$'
 *            nullable: true
 *            example: 'https://picture.example.com'
 *          role:
 *            $ref: '#/components/schemas/Role'
 *          createdAt:
 *            description: Date and time when the user was created
 *            type: string
 *            format: date-time
 *            example: '2017-07-21T17:32:28Z'
 *          updatedAt:
 *            description: Date and time when the user was updated
 *            type: string
 *            format: date-time
 *            example: '2017-07-21T17:32:28Z'
 */
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

/**
 *  @swagger
 *  components:
 *    schemas:
 *      CreateUserType:
 *        description: Information about the user to be created
 *        type: object
 *        required:
 *          - email
 *        properties:
 *          name:
 *            description: Name and surname of the user
 *            type: string
 *            pattern: '^[a-zA-Z0-9\s]{1,}$'
 *            nullable: true
 *            example: 'John Doe'
 *          email:
 *            description: E-mail of the user used to authenticate it. It is unique
 *            type: string
 *            pattern: '^[\w\-\.]+@([\w-]+\.)+[\w-]{2,4}$'
 *            example: 'john.doe@example.com'
 *          username:
 *            description: Username of the user
 *            type: string
 *            pattern: '^[a-zA-Z0-9.]{1,}$'
 *            nullable: true
 *            example: 'j.doe'
 *          imagePath:
 *            description: Path of the user picture
 *            type: string
 *            pattern: '^(\b(https?|ftp|file)://)[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]$'
 *            nullable: true
 *            example: 'https://picture.example.com'
 *          role:
 *            $ref: '#/components/schemas/Role'
 */
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

/**
 *  @swagger
 *  components:
 *    schemas:
 *      UpdateUserType:
 *        description: Information about the user to be updated
 *        type: object
 *        properties:
 *          name:
 *            description: Name and surname of the user
 *            type: string
 *            pattern: '^[a-zA-Z0-9\s]{1,}$'
 *            nullable: true
 *            example: 'John Doe'
 *          username:
 *            description: Username of the user
 *            type: string
 *            pattern: '^[a-zA-Z0-9.]{1,}$'
 *            nullable: true
 *            example: 'j.doe'
 *          imagePath:
 *            description: Path of the user picture
 *            type: string
 *            pattern: '^(\b(https?|ftp|file)://)[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]$'
 *            nullable: true
 *            example: 'https://picture.example.com'
 *          role:
 *            $ref: '#/components/schemas/Role'
 */
export async function updateUser(
  prisma: PrismaClient,
  userId: string,
  name?: string | null,
  username?: string | null,
  imagePath?: string | null,
  role?: Role,
) {
  if (typeof name === 'string' && !patternNameSurname.test(name)) {
    throw new ParameterFormatError(`Parameter not correct: name ${name}`, formatErrorCode);
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
  if (typeof take != 'undefined') {
    if (take < minimumTakeRecordNumber) {
      throw new ParameterFormatError(`Parameter not in range: take ${take}`, minimumValueErrorCode);
    } else if (take > maximumTakeRecordNumber) {
      throw new ParameterFormatError(`Parameter not in range: take ${take}`, maximumValueErrorCode);
    }
  }
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
  if (typeof take != 'undefined') {
    if (take < minimumTakeRecordNumber) {
      throw new ParameterFormatError(`Parameter not in range: take ${take}`, minimumValueErrorCode);
    } else if (take > maximumTakeRecordNumber) {
      throw new ParameterFormatError(`Parameter not in range: take ${take}`, maximumValueErrorCode);
    }
  }
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
