export type Response<T> = {
  status: 'error' | 'fail' | 'success';
  data: T;
};
