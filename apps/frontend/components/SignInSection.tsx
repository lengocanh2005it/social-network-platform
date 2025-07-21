import SignInForm from "@/components/form/SignInForm";

const SignInSection = () => {
  return (
    <section
      className="flex md:gap-6 gap-4 p-4 rounded-lg
      dark:bg-black dark:text-white text-black flex-col md:w-1/2 
      w-full items-center justify-center shadow-sm
      dark:shadow-white/60"
    >
      <div className="text-center w-full flex flex-col items-center justify-center md:gap-1 h-1/2">
        <h1 className="md:text-2xl text-xl">Sign In</h1>

        <p className="md:text-sm text-[14px] text-black/60 dark:text-white">
          Sign in to catch up with your friends and shares moments together
        </p>
      </div>

      <SignInForm />
    </section>
  );
};

export default SignInSection;
