import ParameterFormatError from 'lib/exceptions/ParameterFormatError';
import { patternEmail, patternNameSurname, patternUrl, patternUsername } from 'lib/regexPattern';

import type { Role } from '@prisma/client';

export type UserJSON = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  imagePath?: string | null;
  role?: Role | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export default class User {
  private _id: string | null | undefined;
  private _name: string | null | undefined;
  private _email: string | null | undefined;
  private _username: string | null | undefined;
  private _imagePath: string | null | undefined;
  private _role: Role | null | undefined;
  private _createdAt: Date | null | undefined;
  private _updatedAt: Date | null | undefined;

  constructor(
    id?: string | null,
    name?: string | null,
    email?: string | null,
    username?: string | null,
    imagePath?: string | null,
    role?: Role | null,
    createdAt?: Date | null,
    updatedAt?: Date | null,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.username = username;
    this.imagePath = imagePath;
    this.role = role;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  public get id(): string | null | undefined {
    return this._id;
  }

  public set id(value: string | null | undefined) {
    this._id = value;
  }

  public get name(): string | null | undefined {
    return this._name;
  }

  public set name(value: string | null | undefined) {
    if (typeof value === 'string' && !patternNameSurname.test(value)) {
      throw new ParameterFormatError('Name not correct');
    }
    this._name = value;
  }

  public get email(): string | null | undefined {
    return this._email;
  }

  public set email(value: string | null | undefined) {
    if (typeof value === 'string' && !patternEmail.test(value)) {
      throw new ParameterFormatError('Email not correct');
    }
    this._email = value;
  }

  public get username(): string | null | undefined {
    return this._username;
  }

  public set username(value: string | null | undefined) {
    if (typeof value === 'string' && !patternUsername.test(value)) {
      throw new ParameterFormatError('Username not correct');
    }
    this._username = value;
  }

  public get imagePath(): string | null | undefined {
    return this._imagePath;
  }

  public set imagePath(value: string | null | undefined) {
    if (typeof value === 'string' && !patternUrl.test(value)) {
      throw new ParameterFormatError('Image path not correct');
    }
    this._imagePath = value;
  }

  public get role(): Role | null | undefined {
    return this._role;
  }

  public set role(value: Role | null | undefined) {
    this._role = value;
  }

  public get createdAt(): Date | null | undefined {
    return this._createdAt;
  }

  public set createdAt(value: Date | null | undefined) {
    this._createdAt = value;
  }

  public get updatedAt(): Date | null | undefined {
    return this._updatedAt;
  }

  public set updatedAt(value: Date | null | undefined) {
    this._updatedAt = value;
  }

  public toJSON() {
    const result: UserJSON = {};
    result.id = this._id;
    result.name = this._name;
    result.email = this._email;
    result.username = this._username;
    result.imagePath = this._imagePath;
    result.role = this._role;
    if (typeof this._createdAt !== 'undefined') {
      if (this._createdAt === null) {
        result.createdAt = null;
      } else {
        result.createdAt = this._createdAt.toJSON();
      }
    }
    if (typeof this._updatedAt !== 'undefined') {
      if (this._updatedAt === null) {
        result.updatedAt = null;
      } else {
        result.updatedAt = this._updatedAt.toJSON();
      }
    }
    return result;
  }
}
