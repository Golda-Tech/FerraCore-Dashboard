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
  passwordResetRequired: boolean;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  organizationName: string;
  mobileNumber: string;
  planType: PlanType;

}

export enum PlanType {
  COLLECTIONS = "COLLECTIONS",
  DISBURSEMENTS = "DISBURSEMENTS",
  PREAPPROVALS = "PREAPPROVALS",
  ALL_INCLUSIVE = "ALL_INCLUSIVE",
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


export interface ResetPasswordRequest {
  email: string;
  tempPassword: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}