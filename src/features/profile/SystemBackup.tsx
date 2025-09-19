import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  HStack,
  Tag,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Heading,
  Divider,
  AbsoluteCenter,
  Icon,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBackups,
  createBackup,
  restoreBackup,
  deleteBackup,
  uploadBackup,
} from "./api";
import api from "@/lib/api"; // Import api instance for polling
import { toastDefaults } from "@/components/shared/utils";
import { FaDatabase, FaTrash, FaRedo, FaPlus, FaUpload } from "react-icons/fa";

const SystemBackup: React.FC = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);

  const {
    isOpen: isRestoreOpen,
    onOpen: onRestoreOpen,
    onClose: onRestoreClose,
  } = useDisclosure();

  const {
    isOpen: isUploadRestoreOpen,
    onOpen: onUploadRestoreOpen,
    onClose: onUploadRestoreClose,
  } = useDisclosure();

  const {
    data: backups,
    isLoading,
    isError,
  } = useQuery<string[], Error>({
    queryKey: ["backups"],
    queryFn: getBackups,
  });

  const poll = (
    check: () => Promise<boolean>,
    timeout = 30000,
    interval = 2000,
  ) => {
    return new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      const intervalId = setInterval(async () => {
        if (Date.now() - startTime > timeout) {
          clearInterval(intervalId);
          reject(new Error("Operation timed out."));
          return;
        }
        if (await check()) {
          clearInterval(intervalId);
          resolve();
        }
      }, interval);
    });
  };

  const createMutation = useMutation({
    mutationFn: createBackup,
    onSuccess: (data) => {
      toast({
        ...toastDefaults,
        title: "Backup Started",
        description: `Creating backup: ${data.filename}`,
        status: "info",
      });
      const checkFn = async () => {
        await queryClient.invalidateQueries({ queryKey: ["backups"] });
        const newBackups = queryClient.getQueryData<string[]>(["backups"]);
        return newBackups?.includes(data.filename) || false;
      };
      poll(checkFn)
        .then(() =>
          toast({
            ...toastDefaults,
            title: "Success",
            description: "Database backup completed.",
            status: "success",
          }),
        )
        .catch((err) =>
          toast({
            ...toastDefaults,
            title: "Error",
            description: err.message,
            status: "error",
            duration: 5000,
          }),
        );
    },
    onError: (error: Error) =>
      toast({
        ...toastDefaults,
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBackup,
    onSuccess: (_, variables) => {
      toast({
        ...toastDefaults,
        title: "Deletion Started",
        description: `Deleting backup: ${variables}`,
        status: "info",
      });
      const checkFn = async () => {
        await queryClient.invalidateQueries({ queryKey: ["backups"] });
        const newBackups = queryClient.getQueryData<string[]>(["backups"]);
        return !newBackups?.includes(variables);
      };
      poll(checkFn)
        .then(() =>
          toast({
            ...toastDefaults,
            title: "Success",
            description: "Backup file deleted.",
            status: "success",
          }),
        )
        .catch((err) =>
          toast({
            ...toastDefaults,
            title: "Error",
            description: err.message,
            status: "error",
            duration: 5000,
          }),
        );
    },
    onError: (error: Error) =>
      toast({
        ...toastDefaults,
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
      }),
  });

  const restoreMutation = useMutation({
    mutationFn: restoreBackup,
    onSuccess: () => {
      toast({
        ...toastDefaults,
        title: "Restore Started",
        description: "Please wait, the system will restart.",
        status: "info",
      });
      setIsRestoring(true);
      const checkFn = async () => {
        try {
          await api.get("/api/sysinfo");
          return true;
        } catch {
          return false;
        }
      };
      poll(checkFn, 60000, 3000) // 1 minute timeout for restore
        .then(() =>
          toast({
            ...toastDefaults,
            title: "Success",
            description: "Database restore completed successfully.",
            status: "success",
          }),
        )
        .catch(() =>
          toast({
            ...toastDefaults,
            title: "Error",
            description: "Restore process timed out or failed.",
            status: "error",
            duration: 5000,
          }),
        )
        .finally(() => setIsRestoring(false));
    },
    onError: (error: Error) =>
      toast({
        ...toastDefaults,
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
      }),
  });

  const uploadMutation = useMutation({
    mutationFn: uploadBackup,
    onSuccess: (data) => {
      toast({
        ...toastDefaults,
        title: "Upload Successful",
        description: data.message,
        status: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      handleRestoreClick(data.filename);
    },
    onError: (error: Error) =>
      toast({
        ...toastDefaults,
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
      }),
  });

  const handleRestoreClick = (filename: string) => {
    setSelectedFile(filename);
    onRestoreOpen();
  };

  const confirmRestore = () => {
    if (selectedFile) {
      restoreMutation.mutate(selectedFile);
      onRestoreClose();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileToUpload(file);
      onUploadRestoreOpen();
    }
    event.target.value = ""; // Reset file input
  };

  const confirmUploadAndRestore = () => {
    if (fileToUpload) {
      uploadMutation.mutate(fileToUpload);
    }
    onUploadRestoreClose();
  };

  if (isLoading) {
    return (
      <Box w="full" px={{ base: 6, md: 8 }} py={{ base: 6, md: 8 }}>
        <VStack spacing={4} py={8}>
          <Box
            w={12}
            h={12}
            borderRadius="full"
            bg="blue.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={FaDatabase} color="blue.600" boxSize={6} />
          </Box>
          <Text color="gray.600" fontSize="lg">
            Loading backups...
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box position="relative" w="full">
      {isRestoring && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.700"
          zIndex="modal"
        >
          <AbsoluteCenter>
            <VStack color="white">
              <Spinner size="xl" />
              <Heading size="md">Restoring database...</Heading>
              <Text>Please wait, this may take a moment.</Text>
            </VStack>
          </AbsoluteCenter>
        </Box>
      )}

      <Box px={{ base: 6, md: 8 }} py={{ base: 6, md: 8 }}>
        <VStack spacing={8} align="stretch" maxW="4xl">
          {/* Header Section */}
          <Box>
            <Heading size="md">Database Backup Management</Heading>
            <Text mt={2} fontSize="sm" color="gray.500">
              Create new backups, upload existing ones, or restore from
              available backup files.
            </Text>
          </Box>

           {/* Action Buttons Section */}
           <Box>
             <Text fontSize="sm" fontWeight="600" color="gray.700" mb={4}>
               Backup Actions
             </Text>
             <VStack spacing={4} align="stretch">
               <HStack
                 spacing={4}
                 flexDir={{ base: "column", sm: "row" }}
                 align="stretch"
               >
                 <Button
                   leftIcon={<Icon as={FaPlus} size={20} />}
                   colorScheme="blue"
                   onClick={() => createMutation.mutate()}
                   isLoading={createMutation.isPending}
                   size="lg"
                   h="56px"
                   fontSize="md"
                   fontWeight="600"
                   borderRadius="md"
                   px={8}
                   bgGradient="linear(to-r, blue.500, blue.600)"
                   _hover={{
                     bgGradient: "linear(to-r, blue.600, blue.700)",
                     transform: "translateY(-1px)",
                     shadow: "lg",
                   }}
                   _active={{
                     transform: "translateY(0)",
                   }}
                   transition="all 0.2s"
                   shadow="md"
                 >
                   Create New Backup
                 </Button>
                 <Button
                   leftIcon={<Icon as={FaUpload} size={20} />}
                   colorScheme="teal"
                   onClick={() => inputFileRef.current?.click()}
                   isLoading={uploadMutation.isPending}
                   size="lg"
                   h="56px"
                   fontSize="md"
                   fontWeight="600"
                   borderRadius="md"
                   px={8}
                   bgGradient="linear(to-r, teal.500, teal.600)"
                   _hover={{
                     bgGradient: "linear(to-r, teal.600, teal.700)",
                     transform: "translateY(-1px)",
                     shadow: "lg",
                   }}
                   _active={{
                     transform: "translateY(0)",
                   }}
                   transition="all 0.2s"
                   shadow="md"
                 >
                   Upload & Restore
                 </Button>
               </HStack>
               <input
                 type="file"
                 accept=".dump"
                 ref={inputFileRef}
                 style={{ display: "none" }}
                 onChange={handleFileChange}
               />
             </VStack>
           </Box>

          <Divider borderColor="gray.200" />

          {/* Available Backups Section */}
          <Box>
            <Text fontSize="sm" fontWeight="600" color="gray.700" mb={4}>
              Available Backups
            </Text>
            {isError && (
              <Card
                bg="red.50"
                borderRadius="md"
                border="1px"
                borderColor="red.200"
              >
                <CardBody px={6} py={4}>
                  <HStack spacing={3}>
                    <Box
                      w={8}
                      h={8}
                      borderRadius="md"
                      bg="red.100"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="lg" color="red.600">
                        ⚠️
                      </Text>
                    </Box>
                    <Text color="red.700" fontWeight="500">
                      Error fetching backups. Please try again.
                    </Text>
                  </HStack>
                </CardBody>
              </Card>
            )}

            {backups && backups.length > 0 && (
              <VStack spacing={3} align="stretch">
                {backups.map((file) => (
                  <Card
                    key={file}
                    bg="white"
                    borderRadius="md"
                    border="1px"
                    borderColor="gray.200"
                    shadow="sm"
                  >
                    <CardBody px={6} py={4}>
                      <HStack
                        justify="space-between"
                        align="center"
                        spacing={4}
                      >
                        <HStack spacing={3} flex={1} minW={0}>
                          <Box
                            w={10}
                            h={10}
                            borderRadius="md"
                            bg="blue.100"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                          >
                            <Icon
                              as={FaDatabase}
                              color="blue.600"
                              boxSize={5}
                            />
                          </Box>
                          <Box flex={1} minW={0}>
                            <Text
                              fontSize="md"
                              fontWeight="600"
                              color="gray.900"
                              isTruncated
                            >
                              {file}
                            </Text>
                          </Box>
                        </HStack>
                        <HStack spacing={2} flexShrink={0}>
                          <Button
                            size="sm"
                            leftIcon={<Icon as={FaRedo} boxSize={3} />}
                            onClick={() => handleRestoreClick(file)}
                            colorScheme="teal"
                            variant="solid"
                            borderRadius="md"
                            h="40px"
                            px={4}
                            fontSize="sm"
                            fontWeight="500"
                            _hover={{
                              transform: "translateY(-1px)",
                              shadow: "md",
                            }}
                            _active={{
                              transform: "translateY(0)",
                            }}
                            transition="all 0.2s"
                          >
                            Restore
                          </Button>
                          <Button
                            size="sm"
                            leftIcon={<Icon as={FaTrash} boxSize={3} />}
                            colorScheme="red"
                            variant="outline"
                            onClick={() => deleteMutation.mutate(file)}
                            borderRadius="md"
                            h="40px"
                            px={4}
                            fontSize="sm"
                            fontWeight="500"
                            _hover={{
                              bg: "red.50",
                              transform: "translateY(-1px)",
                              shadow: "md",
                            }}
                            _active={{
                              transform: "translateY(0)",
                            }}
                            transition="all 0.2s"
                          >
                            Delete
                          </Button>
                        </HStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            )}

            {backups?.length === 0 && !isLoading && (
              <Card
                bg="gray.50"
                borderRadius="md"
                border="1px"
                borderColor="gray.200"
              >
                <CardBody px={6} py={8}>
                  <VStack spacing={3}>
                    <Box
                      w={12}
                      h={12}
                      borderRadius="full"
                      bg="gray.200"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FaDatabase} color="gray.500" boxSize={6} />
                    </Box>
                    <Text color="gray.600" fontSize="md" textAlign="center">
                      No backups found
                    </Text>
                    <Text color="gray.500" fontSize="sm" textAlign="center">
                      Create your first backup to get started.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </Box>
        </VStack>
      </Box>

      {/* Restore Confirmation Modal */}
      <Modal isOpen={isRestoreOpen} onClose={onRestoreClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Restore</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to restore the database from{" "}
              <Tag colorScheme="blue" size="sm">
                {selectedFile}
              </Tag>
              ?
            </Text>
            <Text mt={4} fontWeight="bold" color="red.500">
              This action is irreversible and will overwrite all current data.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRestoreClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={confirmRestore}
              isLoading={restoreMutation.isPending}
            >
              Restore
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Upload and Restore Confirmation Modal */}
      <Modal isOpen={isUploadRestoreOpen} onClose={onUploadRestoreClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Upload and Restore</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>You are about to upload and restore the database from:</Text>
            <Tag mt={2} colorScheme="green" size="sm">
              {fileToUpload?.name}
            </Tag>
            <Text mt={4} fontWeight="bold" color="red.500">
              This will first upload the file, and then immediately begin the
              restore process, overwriting all current data. Are you sure you
              want to proceed?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onUploadRestoreClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={confirmUploadAndRestore}
              isLoading={uploadMutation.isPending}
            >
              Yes, Upload and Restore
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SystemBackup;
