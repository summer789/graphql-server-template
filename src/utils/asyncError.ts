export async function asyncError<T, U = Error>(
  promise: Promise<T>,
  errorExt?: object,
) {
  return promise
    .then<[null, T]>((data: T) => [null, data])
    .catch<[U, null]>((error: U) => {
      if (errorExt) {
        return [{ ...error, ...errorExt }, null];
      }
      return [error, null];
    });
}
