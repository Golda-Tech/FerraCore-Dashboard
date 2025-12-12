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
  firstTimeUser: boolean;
}

export interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  organizationName: string;
  mobileNumber: string;
  planType: PlanType;

}


export interface ProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "admin" | "user";
  organization: {
    name: string;
    businessType: string;
    address: string;
    isFirstTimeUser: boolean;
    registrationNumber: string;
    taxId: string;
    website: string;
  };
  subscription: {
    plan: string;
    status: string;
    billingCycle: string;
    nextBilling: string;
    amount: number;
    currency: string;
  };
  apiCredentials: {
    subscriptionKey: string;
    subscriptionSecret: string;
  };
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