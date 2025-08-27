import React, { useCallback, useMemo, useState } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Box,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import axios, { AxiosError } from "axios";
import config from "@/config";
import { toastDefaults } from "./utils";

// Define props interface
interface FormNotesProps {
  ledgerId: string;
  notes: string;
  // eslint-disable-next-line no-unused-vars
  setNotes: (notes: string) => void;
  borderColor: string;
}

// Define interface for API response error
interface ApiErrorResponse {
  detail?: string;
}

const FormNotes: React.FC<FormNotesProps> = ({
  ledgerId,
  notes,
  setNotes,
  borderColor,
}) => {
  const toast = useToast();
  const [noteSuggestions, setNoteSuggestions] = useState<string[]>([]);
  const notesSuggestionsBoxBgColor = useColorModeValue("gray.50", "gray.700");
  const notesSuggestionsBoxItemBgColor = useColorModeValue(
    "gray.100",
    "gray.600",
  );

  // eslint-disable-next-line no-unused-vars
  const debounce = <F extends (...args: any[]) => any>(
    func: F,
    delay: number,
  ) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return function (this: any, ...args: Parameters<F>) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  const fetchNoteSuggestions = useCallback(
    async (search_text: string) => {
      if (search_text.length >= 3) {
        try {
          const token = localStorage.getItem("access_token");
          const response = await axios.get(
            `${config.apiBaseUrl}/ledger/${ledgerId}/transaction/notes/suggestions`,
            {
              params: { search_text },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          setNoteSuggestions(Array.from(new Set(response.data)));
        } catch (error) {
          const apiError = error as AxiosError<ApiErrorResponse>;
          toast({
            description:
              apiError.response?.data?.detail ||
              "Failed to fetch note suggestions.",
            status: "error",
            ...toastDefaults,
          });
        }
      } else {
        setNoteSuggestions([]);
      }
    },
    [ledgerId, toast, setNoteSuggestions],
  );

  const debouncedFetchNoteSuggestions = useMemo(
    () => debounce(fetchNoteSuggestions, 500),
    [fetchNoteSuggestions],
  );

  return (
    <FormControl mb={4}>
      <FormLabel fontSize="sm" fontWeight="medium">
        Notes
      </FormLabel>
      <Input
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          debouncedFetchNoteSuggestions(e.target.value);
        }}
        onBlur={() => setNoteSuggestions([])}
        placeholder="Description (optional)"
        borderColor={borderColor}
      />
      {/* Display note suggestions */}
      {noteSuggestions.length > 0 && (
        <Box
          mt={2}
          borderWidth="1px"
          borderRadius="md"
          borderColor={borderColor}
          p={2}
          bg={notesSuggestionsBoxBgColor}
          maxH="150px"
          overflowY="auto"
          position="relative"
          zIndex={10}
          pointerEvents="auto"
          tabIndex={-1}
        >
          {noteSuggestions.map((note, index) => (
            <Box
              key={index}
              p={2}
              cursor="pointer"
              borderRadius="md"
              _hover={{
                bg: notesSuggestionsBoxItemBgColor,
              }}
              tabIndex={-1}
              onMouseDown={(e) => {
                e.preventDefault();
                setNotes(note);
                setNoteSuggestions([]);
              }}
            >
              {note}
            </Box>
          ))}
        </Box>
      )}
    </FormControl>
  );
};

export default FormNotes;
