export class CustomError extends Error {
  public errorCode?: string;
  public stack?: string;
  constructor(message: string, errorCode?: string, stack?: string) {
    super(message);
    this.name = 'CustomError';
    this.errorCode = errorCode;
    this.stack = stack;
  }
}
