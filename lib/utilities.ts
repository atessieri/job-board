export function classNames(...classes: (string | undefined)[]) {
  return classes.filter((item) => typeof item !== 'undefined').join(' ');
}
