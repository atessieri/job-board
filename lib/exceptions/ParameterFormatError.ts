import CustomError from 'lib/exceptions/CustomError';

export default class ParameterFormatError extends CustomError {
  constructor(message: string, errorCode?: string) {
    super(message, errorCode);
    this.name = 'ParameterFormatError';
  }
}
