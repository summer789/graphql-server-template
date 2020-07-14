import { ValidationError } from 'yup';

export function formatYupError(error: ValidationError) {
  return error.inner.map(({ path, message }) => ({
    path,
    message,
  }));
}
