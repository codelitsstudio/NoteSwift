declare type ApiResponse<T = {}> =
  | {
      error: false;
      status: number;
      result: T;
      message: string;
    }
  | {
      error: true;
      status: number;
      result: null;
      message: string;
    };