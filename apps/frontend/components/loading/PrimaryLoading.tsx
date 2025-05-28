"use client";
import { Spinner } from "@heroui/react";
import React from "react";

const PrimaryLoading: React.FC = () => {
  return (
    <div
      className="w-full md:mt-8 mt-4 flex md:gap-3 gap-2 
            flex-col items-center justify-center text-center"
    >
      <Spinner />

      <p>Loading...</p>
    </div>
  );
};

export default PrimaryLoading;
