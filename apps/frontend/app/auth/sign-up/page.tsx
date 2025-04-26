import SideCredentials from "@/components/SideCredentials";
import SignUpSection from "@/components/SignUpSection";

const SignUpPage = () => {
  return (
    <main
      className="flex md:flex-row flex-col px-10 py-4 bg-white text-black md:h-screen h-fit mx-auto
     w-full justify-between gap-8 items-center"
    >
      <SideCredentials />

      <SignUpSection />
    </main>
  );
};

export default SignUpPage;
