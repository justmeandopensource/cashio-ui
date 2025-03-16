import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Input, FormControl } from "@chakra-ui/react";

interface ChakraDatePickerProps {
  selected: Date | null;
  // eslint-disable-next-line no-unused-vars
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  minDate?: Date | null;
  shouldCloseOnSelect?: boolean;
}

const ChakraDatePicker: React.FC<ChakraDatePickerProps> = ({
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
        onChange={onChange as any}
        dateFormat="yyyy/MM/dd"
        customInput={<Input />}
        showPopperArrow={false}
        popperPlacement="bottom-start"
        popperModifiers={
          {
            offset: {
              enabled: true,
              offset: "5px, 10px",
            },
            preventOverflow: {
              enabled: true,
              escapeWithReference: false,
              boundariesElement: "viewport",
            },
          } as any
        }
        placeholderText={placeholderText}
        minDate={minDate === null ? undefined : minDate}
        shouldCloseOnSelect={shouldCloseOnSelect}
      />
    </FormControl>
  );
};

export default ChakraDatePicker;
