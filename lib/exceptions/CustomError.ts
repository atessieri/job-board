export default class CustomError extends Error {
  public errorCode?: string;
  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = 'CustomError';
    this.errorCode = errorCode;
  }
}
