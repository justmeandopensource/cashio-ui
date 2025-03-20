import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const Theme: ThemeConfig = extendTheme({
  styles: {
    global: {
      "*": {
        WebkitTapHighlightColor: "transparent",
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
