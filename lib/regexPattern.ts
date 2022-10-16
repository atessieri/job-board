export const minimumTakeRecordNumber = 1;
export const maximumTakeRecordNumber = 1000;

export const minimumFakeRecordNumber = 1;
export const maximumFakeRecordNumber = 1000;

export const patternNameSurnameString = "^[a-zA-Z0-9\\'.\\s\\-]{1,}$";
export const patternNameSurname = new RegExp(patternNameSurnameString);

export const patternEmailString = '^[\\w\\-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$';
export const patternEmail = new RegExp(patternEmailString);

export const patternUsernameString = '^[a-zA-Z0-9._\\-]{1,}$';
export const patternUsername = new RegExp(patternUsernameString);

export const patternUrlString =
  '^(\\b(https?|ftp|file)://)[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]$';
export const patternUrl = new RegExp(patternUrlString);

export const patternDecimalString = '^\\d{1,6}(\\.\\d{0,3})?$';
export const patternDecimal = new RegExp(patternDecimalString);

export const jobTitleMinSize = 1;
export const jobTitleMaxSize = 80;
export const patternJobTitleString = `^[\\s\\w\\d\\x21-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\x7e]{${jobTitleMinSize},${jobTitleMaxSize}}$`;
export const patternJobTitle = new RegExp(patternJobTitleString);

export const jobDescriptionMinSize = 1;
export const jobDescriptionMaxSize = 2000;
export const patternJobDescriptionString = `^[\\s\\w\\d\\x21-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\x7e]{${jobDescriptionMinSize},${jobDescriptionMaxSize}}$`;
export const patternJobDescription = new RegExp(patternJobDescriptionString);

export const jobLocationMinSize = 1;
export const jobLocationMaxSize = 80;
export const patternJobLocationString = `^[\\s\\w\\d\\x21-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\x7e]{${jobLocationMinSize},${jobLocationMaxSize}}$`;
export const patternJobLocation = new RegExp(patternJobLocationString);

export const appCoverLetterMinSize = 1;
export const appCoverLetterMaxSize = 1000;
export const patternAppCoverLetterString = `^[\\s\\w\\d\\x21-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\x7e]{${appCoverLetterMinSize},${appCoverLetterMaxSize}}$`;
export const patternAppCoverLetter = new RegExp(patternAppCoverLetterString);
