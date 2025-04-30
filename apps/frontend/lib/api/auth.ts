import axios from "@/lib/axios";
import {
  ForgotPasswordDto,
  GenerateToken,
  GetInfoOAuthCallbackDto,
  OAuthCallbackDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerifyEmailDto,
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
  getInfoOAuthCallbackDto: GetInfoOAuthCallbackDto
) => {
  const response = await axios.post(
    "/auth/oauth/callback/get-info",
    getInfoOAuthCallbackDto
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
