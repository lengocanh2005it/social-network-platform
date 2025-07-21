import { heroui } from "@heroui/react";
export default heroui({
  defaultTheme: "light",
  themes: {
    light: {
      colors: {
        primary: "#0d9488",
        background: "#ffffff",
      },
    },
    dark: {
      colors: {
        primary: "#000000",
        background: "#000000",
      },
    },
  },
});
