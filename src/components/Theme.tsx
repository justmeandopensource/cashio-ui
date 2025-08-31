import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const Theme: ThemeConfig = extendTheme({
  styles: {
    global: {
      "*": {
        WebkitTapHighlightColor: "transparent",
      },
      body: {
        color: "secondaryTextColor",
      },
    },
  },
  semanticTokens: {
    colors: {
      primaryTextColor: {
        default: "gray.800",
        _dark: "gray.100",
      },
      secondaryTextColor: {
        default: "gray.700",
        _dark: "gray.300",
      },
      tertiaryTextColor: {
        default: "gray.600",
        _dark: "gray.400",
      },
    },
  },
  components: {
    Input: {
      defaultProps: {
        focusBorderColor: "teal.500",
      },
    },
    Select: {
      defaultProps: {
        focusBorderColor: "teal.500",
      },
    },
    Checkbox: {
      defaultProps: {
        colorScheme: "teal",
      },
    },
    Button: {
      defaultProps: {
        colorScheme: "teal",
      },
    },
  },
});

export default Theme;
