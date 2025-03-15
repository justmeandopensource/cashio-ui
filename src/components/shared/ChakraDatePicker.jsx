import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Input, FormControl } from "@chakra-ui/react";

const ChakraDatePicker = ({
  selected,
  onChange,
  placeholderText,
  minDate = null,
  shouldCloseOnSelect = false,
}) => {
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
            offset: "5px, 10px",
          },
          preventOverflow: {
            enabled: true,
            escapeWithReference: false,
            boundariesElement: "viewport",
          },
        }}
        placeholderText={placeholderText}
        minDate={minDate}
        shouldCloseOnSelect={shouldCloseOnSelect}
      />
    </FormControl>
  );
};

export default ChakraDatePicker;
