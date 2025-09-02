export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  message: string;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  message: string;
}
