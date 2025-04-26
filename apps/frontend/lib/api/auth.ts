import axios from "@/lib/axios";
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerifyEmailDto,
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
