import { extendTheme } from '@chakra-ui/react'

const Theme = extendTheme({
  components: {
    Input: {
      defaultProps: {
        focusBorderColor: 'teal.500',
      },
    },
    Select: {
      defaultProps: {
        focusBorderColor: 'teal.500',
      },
    },
    Checkbox: {
      defaultProps: {
        colorScheme: 'teal',
      },
    },
    Button: {
      defaultProps: {
        colorScheme: 'teal',
      },
    },
  },
})

export default Theme
