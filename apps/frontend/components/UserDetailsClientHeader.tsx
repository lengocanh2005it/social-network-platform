import { Button } from "@heroui/react";
import { ArrowLeftToLine } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const UserDetailsClientHeader: React.FC = () => {
  const router = useRouter();

  const handleBackward = () => router.push("/dashboard/users");

  return (
    <div
      className="flex flex-col md:flex-row justify-between items-start 
        md:items-center gap-4 md:mb-6 mb-4"
    >
      <div className="flex flex-col relative">
        <h1
          className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 
        bg-clip-text text-transparent"
        >
          User Profile
        </h1>

        <p className="text-default-500">Detailed overview of user account</p>
      </div>

      <Button isIconOnly onPress={handleBackward}>
        <ArrowLeftToLine />
      </Button>
    </div>
  );
};

export default UserDetailsClientHeader;
