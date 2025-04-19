"use client";
import { HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider>{children}</HeroUIProvider>
    </QueryClientProvider>
  );
};

export default AppProviders;
