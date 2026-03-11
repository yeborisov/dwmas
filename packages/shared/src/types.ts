export type Role = 'DEVELOPER' | 'DEVOPS' | 'ADMIN';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
