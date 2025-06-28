export interface ApiResponseBase {

}

export interface ApiResponse<T = {}> {
  result: T;
    error: boolean;
  status: number;
  message: string;
}