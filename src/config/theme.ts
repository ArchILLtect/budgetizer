import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

type ThemeConfig = ReturnType<typeof defineConfig>;

export const config = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        // Important: `bg` is a token group in Chakra's preset. If you override `bg` directly,
        // you'll wipe out `bg.subtle`, `bg.panel`, etc. Override only `bg.DEFAULT` instead.
        bg: {
          DEFAULT: {
            value: {
              _light: "{colors.gray.100}",
              _dark: "{colors.gray.700}",
            },
          },
          subtle: {
            value: { _light: "{colors.gray.100}", _dark: "{colors.gray.900}" },
          },
          muted: {
            value: { _light: "{colors.gray.100}", _dark: "{colors.gray.900}" },
          },
          emphasized: {
            value: { _light: "{colors.gray.200}", _dark: "{colors.gray.800}" },
          },
          inverted: {
            value: { _light: "{colors.black}", _dark: "{colors.white}" },
          },
          panel: {
            value: { _light: "{colors.white}", _dark: "{colors.gray.950}" },
          },
          error: {
            value: { _light: "{colors.red.50}", _dark: "{colors.red.950}" },
          },
          warning: {
            value: { _light: "{colors.orange.50}", _dark: "{colors.orange.950}" },
          },
          success: {
            value: { _light: "{colors.green.50}", _dark: "{colors.green.950}" },
          },
          info: {
            value: { _light: "{colors.blue.50}", _dark: "{colors.blue.950}" },
          },
        },

        fg: {
          DEFAULT: {
            value: { _light: "{colors.black}", _dark: "{colors.gray.50}" },
          },
          muted: {
            value: { _light: "{colors.gray.600}", _dark: "{colors.gray.400}" },
          },
          subtle: {
            value: { _light: "{colors.gray.400}", _dark: "{colors.gray.500}" },
          },
          inverted: {
            value: { _light: "{colors.gray.50}", _dark: "{colors.black}" },
          },
          error: {
            value: { _light: "{colors.red.500}", _dark: "{colors.red.400}" },
          },
          warning: {
            value: { _light: "{colors.orange.600}", _dark: "{colors.orange.300}" },
          },
          success: {
            value: { _light: "{colors.green.600}", _dark: "{colors.green.300}" },
          },
          info: {
            value: { _light: "{colors.blue.600}", _dark: "{colors.blue.300}" },
          },
        },

        border: {
          DEFAULT: {
            value: { _light: "{colors.gray.200}", _dark: "{colors.gray.800}" },
          },
          muted: {
            value: { _light: "{colors.gray.100}", _dark: "{colors.gray.900}" },
          },
          subtle: {
            value: { _light: "{colors.gray.50}", _dark: "{colors.gray.950}" },
          },
          emphasized: {
            value: { _light: "{colors.gray.300}", _dark: "{colors.gray.700}" },
          },
          inverted: {
            value: { _light: "{colors.gray.800}", _dark: "{colors.gray.200}" },
          },
          error: {
            value: { _light: "{colors.red.500}", _dark: "{colors.red.400}" },
          },
          warning: {
            value: { _light: "{colors.orange.500}", _dark: "{colors.orange.400}" },
          },
          success: {
            value: { _light: "{colors.green.500}", _dark: "{colors.green.400}" },
          },
          info: {
            value: { _light: "{colors.blue.500}", _dark: "{colors.blue.400}" },
          },
        },
      },
    },
  },
}) as ThemeConfig;

export const system = createSystem(defaultConfig, config);