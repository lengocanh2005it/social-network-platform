import axios from "@/lib/axios";
import {
  ChangePasswordDto,
  CreateTrustDeviceDto,
  ForgotPasswordDto,
  GenerateToken,
  GetInfoOAuthCallbackDto,
  OAuthCallbackDto,
  ResetPasswordDto,
  SendOtpType,
  SignInDto,
  SignUpDto,
  Verify2FaType,
  VerifyEmailDto,
  VerifyOwnershipOtpType,
  VerifyToken,
} from "@/utils";

export const signUp = async (signUpDto: SignUpDto) => {
  const response = await axios.post("/auth/sign-up", signUpDto);

  return response.data;
};

export const verifyEmail = async (verifyEmailDto: VerifyEmailDto) => {
  const response = await axios.post("/auth/verify-otp", verifyEmailDto);

  return response.data;
};

export const signIn = async (signInDto: SignInDto) => {
  const response = await axios.post("/auth/sign-in", signInDto);

  return response.data;
};

export const forgotPassword = async (forgotPasswordDto: ForgotPasswordDto) => {
  const response = await axios.post("/auth/forgot-password", forgotPasswordDto);

  return response.data;
};

export const resetPassword = async (resetPasswordDto: ResetPasswordDto) => {
  const response = await axios.post("/auth/reset-password", resetPasswordDto);

  return response.data;
};

export const oAuthCallback = async (oAuthCallbackDto: OAuthCallbackDto) => {
  const response = await axios.post("/auth/oauth/callback", oAuthCallbackDto);

  return response.data;
};

export const getInfoOAuthCallback = async (
  getInfoOAuthCallbackDto: GetInfoOAuthCallbackDto,
) => {
  const response = await axios.post(
    "/auth/oauth/callback/get-info",
    getInfoOAuthCallbackDto,
  );

  return response.data;
};

export const generateToken = async (generateTokenDto: GenerateToken) => {
  const response = await axios.post("/auth/generate-token", generateTokenDto);

  return response.data;
};

export const verifyToken = async (verifyTokenDto: VerifyToken) => {
  const response = await axios.post("/auth/verify-token", verifyTokenDto);

  return response.data;
};

export const changePassword = async (changePasswordDto: ChangePasswordDto) => {
  const response = await axios.post("/auth/change-password", changePasswordDto);

  return response.data;
};

export const signOut = async (user_id: string) => {
  const response = await axios.post("/auth/sign-out", undefined, {
    headers: {
      user_id: user_id,
    },
  });

  return response.data;
};

export const sendOtp = async (sendOtpDtp: SendOtpType) => {
  const response = await axios.post("/auth/send-otp", sendOtpDtp);

  return response.data;
};

export const verifyAccountOwnership = async (
  verifyAccountOwnershipDto: VerifyOwnershipOtpType,
) => {
  const response = await axios.post(
    "/auth/account/verify-ownership",
    verifyAccountOwnershipDto,
  );

  return response.data;
};

export const generate2Fa = async () => {
  const response = await axios.post("/auth/2fa/generate");

  return response.data;
};

export const verify2Fa = async (verify2FaDto: Verify2FaType) => {
  const response = await axios.post("/auth/2fa/verify", verify2FaDto);

  return response.data;
};

export const createTrustDevice = async (
  createTrustDeviceDto: CreateTrustDeviceDto,
) => {
  const response = await axios.post("/auth/trust-device", createTrustDeviceDto);

  return response.data;
};
