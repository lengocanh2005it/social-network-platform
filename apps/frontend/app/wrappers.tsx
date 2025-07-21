"use client";
import { HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import React, { useState } from "react";

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider>
        <NextThemesProvider
          attribute="class"
          enableSystem
          defaultTheme="system"
        >
          {children}
        </NextThemesProvider>
      </HeroUIProvider>
    </QueryClientProvider>
  );
};

export default AppProviders;
