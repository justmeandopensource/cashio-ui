import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Tag,
  TagCloseButton,
  TagLabel,
  useColorModeValue,
  useToast,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import axios, { AxiosError } from "axios";
import config from "@/config";
import { toastDefaults } from "./utils";

// Define interfaces for the component
interface TagItem {
  tag_id?: string;
  name: string;
}

interface FormTagsProps {
  tags: (TagItem | string)[];
  // eslint-disable-next-line no-unused-vars
  setTags: (tags: TagItem[]) => void;
  borderColor: string;
  buttonColorScheme: string;
}

// Define interface for API response error
interface ApiErrorResponse {
  detail?: string;
}

const FormTags: React.FC<FormTagsProps> = ({
  tags,
  setTags,
  borderColor,
  buttonColorScheme,
}) => {
  const toast = useToast();
  const [tagSuggestions, setTagSuggestions] = useState<TagItem[]>([]);
  const tagsSuggestionsBoxBgColor = useColorModeValue("gray.50", "gray.700");
  const tagsSuggestionsBoxItemBgColor = useColorModeValue(
    "gray.100",
    "gray.600",
  );
  const [tagInput, setTagInput] = useState<string>("");

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

  // Fetch tag suggestions from the backend
  const fetchTagSuggestions = useCallback(
    async (query: string): Promise<void> => {
      if (query.length >= 3) {
        try {
          const token = localStorage.getItem("access_token");
          const response = await axios.get(
            `${config.apiBaseUrl}/tags/search?query=${query}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          setTagSuggestions(response.data);
        } catch (error) {
          const apiError = error as AxiosError<ApiErrorResponse>;
          toast({
            description:
              apiError.response?.data?.detail ||
              "Failed to fetch tag suggestions.",
            status: "error",
            ...toastDefaults,
          });
        }
      } else {
        setTagSuggestions([]);
      }
    },
    [toast, setTagSuggestions],
  );

  const debouncedFetchTagSuggestions = useMemo(
    () => debounce(fetchTagSuggestions, 500),
    [fetchTagSuggestions],
  );

  // Ensure all tags have a valid name property
  const normalizedTags: TagItem[] =
    tags?.map((tag) => {
      if (typeof tag === "string") {
        return { name: tag };
      }
      return tag as TagItem;
    }) || [];

  // Add a tag to the selected tags list
  const addTag = (tag: TagItem): void => {
    if (
      !normalizedTags.some(
        (t) => t.tag_id === tag.tag_id && t.name === tag.name,
      )
    ) {
      setTags([...normalizedTags, tag]);
      setTagInput("");
      setTagSuggestions([]);
    }
  };

  // Remove a tag from the selected tags list
  const removeTag = (tagName: string): void => {
    setTags(normalizedTags.filter((tag) => tag.name !== tagName));
  };

  // Handle Enter key press in the tags input field
  const handleTagInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTagName = tagInput.trim();

      if (newTagName) {
        // Check if the tag already exists in the selected tags
        const isTagAlreadyAdded = normalizedTags.some(
          (tag) => tag.name.toLowerCase() === newTagName.toLowerCase(),
        );

        if (!isTagAlreadyAdded) {
          // Add the new tag to the selected tags
          const newTag: TagItem = { name: newTagName };
          setTags([...normalizedTags, newTag]);
          setTagInput("");
          setTagSuggestions([]);
        }
      }
    }
  };

  return (
    <FormControl>
      <FormLabel fontSize="sm" fontWeight="medium">
        Tags
      </FormLabel>
      <Box>
        {/* Display selected tags as chips */}
        <Wrap spacing={2} mb={2}>
          {normalizedTags.map((tag, index) => (
            <WrapItem key={tag.tag_id || `tag-${index}`}>
              <Tag
                size="sm"
                borderRadius="full"
                variant="solid"
                colorScheme={buttonColorScheme}
              >
                <TagLabel>{tag.name}</TagLabel>
                <TagCloseButton onClick={() => removeTag(tag.name)} />
              </Tag>
            </WrapItem>
          ))}
        </Wrap>

        {/* Tag input with suggestions */}
        <Input
          value={tagInput}
          onChange={(e) => {
            setTagInput(e.target.value);
            debouncedFetchTagSuggestions(e.target.value);
          }}
          onKeyDown={handleTagInputKeyDown}
          placeholder="Add tags (press Enter)"
          borderColor={borderColor}
          size="md"
        />

        {/* Display tag suggestions */}
        {tagSuggestions.length > 0 && (
          <Box
            mt={2}
            borderWidth="1px"
            borderRadius="md"
            borderColor={borderColor}
            p={2}
            bg={tagsSuggestionsBoxBgColor}
            maxH="150px"
            overflowY="auto"
            position="relative"
            zIndex={10}
          >
            {tagSuggestions.map((tag) => (
              <Box
                key={tag.tag_id}
                p={2}
                cursor="pointer"
                borderRadius="md"
                _hover={{
                  bg: tagsSuggestionsBoxItemBgColor,
                }}
                onClick={() => {
                  addTag(tag);
                  setTagInput("");
                  setTagSuggestions([]);
                }}
              >
                {tag.name}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </FormControl>
  );
};

export default FormTags;
