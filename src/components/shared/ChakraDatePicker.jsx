import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Input, FormControl, FormLabel } from '@chakra-ui/react'

const ChakraDatePicker = ({ selected, onChange }) => {
  return (
    <FormControl>
      <Input
        as={DatePicker}
        selected={selected}
        onChange={onChange}
        dateFormat="yyyy/MM/dd"
        customInput={<Input />}
        showPopperArrow={false}
        popperPlacement="bottom-start"
        popperModifiers={{
          offset: {
            enabled: true,
            offset: '5px, 10px',
          },
          preventOverflow: {
            enabled: true,
            escapeWithReference: false,
            boundariesElement: 'viewport',
          },
        }}
      />
    </FormControl>
  )
}

export default ChakraDatePicker
