export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  links: {
    next: string | null;
    previous: string | null;
  };
}
