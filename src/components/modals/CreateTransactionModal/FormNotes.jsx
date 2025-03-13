import { useCallback, useEffect, useState } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Box,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import config from "@/config";

const FormNotes = ({ ledgerId, notes, setNotes, isOpen, borderColor }) => {
  const toast = useToast();
  const [noteSuggestions, setNoteSuggestions] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setNoteSuggestions([]);
    }
  }, [isOpen]);

  const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };

  const fetchNoteSuggestions = useCallback(
    debounce(async (search_text) => {
      if (search_text.length >= 3) {
        try {
          const token = localStorage.getItem("access_token");
          const response = await axios.get(
            `${config.apiBaseUrl}/ledger/${ledgerId}/transaction/notes/suggestions`,
            {
              params: { search_text: search_text },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          setNoteSuggestions(response.data);
        } catch (error) {
          console.error("Error fetching note suggestions:", error);
          toast({
            title: "Error",
            description:
              error.response?.data?.detail ||
              "Failed to fetch note suggestions.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        setNoteSuggestions([]);
      }
    }, 500),
    [ledgerId, toast],
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
          fetchNoteSuggestions(e.target.value);
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
          bg={useColorModeValue("gray.50", "gray.700")}
          maxH="150px"
          overflowY="auto"
          position="relative"
          zIndex={10}
          pointerEvents="auto"
          tabIndex="-1"
        >
          {noteSuggestions.map((note, index) => (
            <Box
              key={index}
              p={2}
              cursor="pointer"
              borderRadius="md"
              _hover={{
                bg: useColorModeValue("gray.100", "gray.600"),
              }}
              tabIndex="-1"
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
