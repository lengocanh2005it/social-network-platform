import ForgotPasswordForm from "@/components/form/ForgotPasswordForm";

const ForgetPassword = () => {
  return (
    <main
      className="flex flex-col md:px-10 px-4 py-4 bg-white text-black h-screen 
      mx-auto w-full items-center justify-center dark:bg-black dark:text-white"
    >
      <div
        className="flex flex-col justify-center items-center gap-8 md:w-1/2 w-full p-8 py-6
      rounded-lg shadow-sm dark:shadow-white/40"
      >
        <div className="text-center w-full flex flex-col items-center justify-center md:gap-2 gap-1">
          <h1 className="md:text-2xl text-xl">Forgot Your Password</h1>

          <p className="md:text-sm text-[14px] text-black/60 dark:text-white/60">
            Don&apos;t worry! Just enter your email and we&apos;ll help you
            reset your password.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </main>
  );
};

export default ForgetPassword;
