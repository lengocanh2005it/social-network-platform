import Image from "next/image";

const SocialsLoginForm = () => {
  return (
    <div className="w-full text-center space-y-4">
      <div className="relative flex items-center justify-center">
        <hr className="md:w-1/2 w-full border-t border-gray-300" />
        <span className="absolute bg-white px-3 text-sm text-gray-500">
          Or login with
        </span>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full border
         border-gray-300 hover:bg-gray-100 transition cursor-pointer"
        >
          <Image src="/icons/google.svg" alt="Google" width={24} height={24} />
        </button>

        <button
          className="flex items-center justify-center w-10 h-10 rounded-full border
         border-gray-300 hover:bg-gray-100 transition cursor-pointer"
        >
          <Image
            src="/icons/facebook.svg"
            alt="Google"
            width={24}
            height={24}
          />
        </button>
      </div>
    </div>
  );
};

export default SocialsLoginForm;
