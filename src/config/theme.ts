import { defineConfig } from '@chakra-ui/react';

type ThemeConfig = ReturnType<typeof defineConfig>;

export const config = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        bg: { value: { base: '{colors.white}', _dark: '{colors.gray.900}' } },
        text: { value: { base: '{colors.black}', _dark: '{colors.white}' } },
      },
    },
  },
}) as ThemeConfig;