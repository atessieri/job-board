import { CustomError } from 'lib/exceptions/CustomError';

export const formatErrorCode = 'PFE0001';
export const sizeErrorCode = 'PFE0002';

export class ParameterFormatError extends CustomError {
  constructor(message: string, errorCode: string) {
    super(message, errorCode);
    this.name = 'ParameterFormatError';
  }
}
