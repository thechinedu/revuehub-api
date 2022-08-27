// TODO: error responses (5xx errors) are currently handled by nestjs. The structure
// of the response object doesn't match this type.
// Set up the required custom functionality to handle 5xx errors

export type Response<T> = {
  status: 'error' | 'fail' | 'success';
  data: T;
  message?: string;
};
