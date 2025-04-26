"use client";
import { Input } from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface PasswordToggleInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  name: string;
  placeholder?: string;
  startContent?: React.ReactNode;
}

const PasswordToggleInput = ({
  value,
  onChange,
  onBlur,
  name,
  placeholder,
  startContent,
}: PasswordToggleInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        name={name}
        placeholder={placeholder}
        startContent={startContent}
        endContent={
          <div
            onClick={() => setShowPassword((prev) => !prev)}
            className="cursor-pointer text-gray-500"
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </div>
        }
      />
    </div>
  );
};

export default PasswordToggleInput;
