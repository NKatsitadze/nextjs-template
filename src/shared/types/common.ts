export type ServiceError = { error: string };

export type ServiceResult<T> = {
  data: T | ServiceError;
  status: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type PageParams = {
  page: number;
  pageSize: number;
};
