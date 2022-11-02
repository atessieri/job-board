import { CustomError } from 'lib/exceptions/CustomError';

export const noLoggedInErrorCode = 'PHE0001';
export const metodNotAllowedErrorCode = 'PHE0002';
export const metodNotImplementedErrorCode = 'PHE0003';

export class HttpError extends CustomError {
  public httpErrorCode: number;
  constructor(message: string, errorCode: string, httpErrorCode: number, stack?: string) {
    super(message, errorCode, stack);
    this.name = 'HttpError';
    this.httpErrorCode = httpErrorCode;
  }
}
