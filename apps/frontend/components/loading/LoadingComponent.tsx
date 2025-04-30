import { Loader2 } from "lucide-react";

const LoadingComponent = () => {
  return (
    <div className="flex justify-center items-center h-screen w-full bg-white">
      <div className="text-center">
        <Loader2 className="animate-spin md:h-24 md:w-24 w-16 h-16 text-blue-500 mx-auto mb-4" />
        <p className="md:text-xl text-medium font-semibold text-gray-700">
          Processing...
        </p>
      </div>
    </div>
  );
};

export default LoadingComponent;
