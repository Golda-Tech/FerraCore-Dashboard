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
  organizationName: string;
  organizationId: string;
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
  registeredBy: string;
  mobileNumber: string;
  planType: PlanType;
  userType: UserType;
  transactionFee: number;
  cappedAmount: number;
}

export interface WhitelistUpdateRequest {
  phone1: string;
  phone2: string;
  phone3: string;
  phone4: string;

}


export interface ProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isFirstTimeUser: boolean;
  phone: string;
  userRoles:string;
  organization: {
    name: string;
    businessType: string;
    partnerId: string;
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
    callbackUrl: string;
    amount: number;
    currency: string;
    whitelistedNumber1: string;
    whitelistedNumber2: string;
    whitelistedNumber3: string;
    whitelistedNumber4: string;
  };
  apiCredentials: {
    subscriptionKey: string;
    subscriptionSecret: string;
  };
}

export enum PlanType {
    PAYMENT_REQUEST = "PAYMENT_REQUEST",
    PAYOUTS = "PAYOUTS",
    RECURRING_PAYMENTS = "RECURRING_PAYMENTS",
    ENTERPRISE_FULL_ACCESS = "ENTERPRISE_FULL_ACCESS",
}

export enum UserType {
          SUPER_ADMIN = "SUPER_ADMIN",
          GA_ADMIN = "GA_ADMIN",
          BUSINESS_ADMIN = "BUSINESS_ADMIN",
          BUSINESS_FINANCE ="BUSINESS_FINANCE",
          BUSINESS_OPERATOR = "BUSINESS_OPERATOR",
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