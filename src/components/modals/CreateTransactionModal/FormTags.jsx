import { useEffect, useState } from "react";
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
import axios from "axios";
import config from "@/config";

const FormTags = ({ tags, setTags, borderColor, buttonColorScheme }) => {
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const toast = useToast();

  // Fetch tag suggestions as the user types
  useEffect(() => {
    if (tagInput.length > 0) {
      fetchTagSuggestions(tagInput);
    } else {
      setTagSuggestions([]);
    }
  }, [tagInput]);

  // Fetch tag suggestions from the backend
  const fetchTagSuggestions = async (query) => {
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
      console.error("Error fetching tag suggestions:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.detail || "Failed to fetch tag suggestions.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Ensure all tags have a valid name property
  const normalizedTags =
    tags?.map((tag) => {
      if (typeof tag === "string") {
        return { name: tag };
      }
      return tag;
    }) || [];

  // Add a tag to the selected tags list
  const addTag = (tag) => {
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
  const removeTag = (tagName) => {
    setTags((prevTags) => prevTags.filter((tag) => tag.name !== tagName));
  };

  // Handle Enter key press in the tags input field
  const handleTagInputKeyDown = (e) => {
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
          const newTag = { name: newTagName };
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
          onChange={(e) => setTagInput(e.target.value)}
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
            bg={useColorModeValue("gray.50", "gray.700")}
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
                  bg: useColorModeValue("gray.100", "gray.600"),
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
