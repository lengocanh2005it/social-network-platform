import SignUpForm from "@/components/form/SignUpForm";

const SignUpSection = () => {
  return (
    <section
      className="flex md:gap-6 gap-4 p-4 rounded-lg
     text-black flex-col md:w-1/2 w-full items-center justify-center shadow-sm dark:text-white
     dark:shadow-white/60"
    >
      <div className="text-center w-full flex flex-col items-center justify-center md:gap-1 h-1/2">
        <h1 className="md:text-2xl text-xl">Sign Up</h1>

        <p className="md:text-sm text-[14px] text-black/60 dark:text-white/60">
          Connect with friends, share your story, and explore the world with us
        </p>
      </div>

      <SignUpForm />
    </section>
  );
};

export default SignUpSection;
