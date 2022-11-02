import { CustomError } from 'lib/exceptions/CustomError';

export const formatErrorCode = 'PFE0001';
export const sizeErrorCode = 'PFE0002';
export const minimumValueErrorCode = 'PFE0003';
export const maximumValueErrorCode = 'PFE0004';

export class ParameterFormatError extends CustomError {
  constructor(message: string, errorCode: string, stack?: string) {
    super(message, errorCode, stack);
    this.name = 'ParameterFormatError';
  }
}
