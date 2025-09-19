import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "@chakra-ui/react";

interface ChakraDatePickerProps {
  selected: Date | null;
  // eslint-disable-next-line no-unused-vars
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  minDate?: Date | null;
  shouldCloseOnSelect?: boolean;
  "data-testid"?: string;
}

const CustomInput = React.forwardRef<
  HTMLInputElement,
  { value?: string; onClick?: () => void; "data-testid"?: string }
>(({ value, onClick, "data-testid": testId }, ref) => (
  <Input
    onClick={onClick}
    ref={ref}
    value={value}
    data-testid={testId}
    readOnly
  />
));
CustomInput.displayName = "CustomInput";

const ChakraDatePicker: React.FC<ChakraDatePickerProps> = ({
  selected,
  onChange,
  placeholderText,
  minDate = null,
  shouldCloseOnSelect = true,
  "data-testid": testId,
}) => {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      dateFormat="yyyy/MM/dd"
      customInput={<CustomInput data-testid={testId} />}
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
  );
};

export default ChakraDatePicker;
