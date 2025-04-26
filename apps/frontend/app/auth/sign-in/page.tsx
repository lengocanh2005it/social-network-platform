import SideCredentials from "@/components/SideCredentials";
import SignInSection from "@/components/SignInSection";

const SignInPage = () => {
  return (
    <main
      className="flex md:flex-row flex-col px-10 py-4 md:h-screen bg-white text-black mx-auto
    w-full justify-between md:gap-8 gap-6 items-center"
    >
      <SideCredentials />

      <SignInSection />
    </main>
  );
};

export default SignInPage;
