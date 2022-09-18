export const patternNameSurnameString = '^[a-zA-Z0-9s]{1,}$';
export const patternNameSurname = new RegExp(patternNameSurnameString);

export const patternEmailString = '^[a-zA-Z0-9_.-]+@[\\w-]+\\.[\\w-]{2,4}$';
export const patternEmail = new RegExp(patternEmailString);

export const patternUsernameString = '^[a-zA-Z0-9.]{1,}$';
export const patternUsername = new RegExp(patternUsernameString);

export const patternUrlString =
  '^(\\b(https?|ftp|file)://)[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]$';
export const patternUrl = new RegExp(patternUrlString);

export const patternDecimalString = '^/d{1,6}(/./d{0,3})?$';
export const patternDecimal = new RegExp(patternDecimalString);

export const jobTitleMaxSize = 80;
export const patternJobTitleString = `^/X{0,${jobTitleMaxSize}}\$`;
export const patternJobTitle = new RegExp(patternJobTitleString);

export const jobDescriptionMaxSize = 2000;
export const patternJobDescriptionString = `^/X{0,${jobDescriptionMaxSize}}\$`;
export const patternJobDescription = new RegExp(patternJobDescriptionString);

export const jobLocationMaxSize = 80;
export const patternJobLocationString = `^/X{0,${jobLocationMaxSize}}\$`;
export const patternJobLocation = new RegExp(patternJobLocationString);

export const appCoverLetterMaxSize = 1000;
export const patternAppCoverLetterString = `^/X{0,${appCoverLetterMaxSize}}\$`;
export const patternAppCoverLetter = new RegExp(patternAppCoverLetterString);
