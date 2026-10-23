/** Content still marked TODO(Malay) (or empty) renders as a tidy placeholder, never raw. */
export const isTodo = (value?: string | null): boolean => !value || /TODO/.test(value);
