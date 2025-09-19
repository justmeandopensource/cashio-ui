import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  List,
  ListItem,
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
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
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
    onSuccess: (data, variables) => {
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

   return (
     <Box position="relative" maxW="md">
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
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md">Create or Restore from Backup</Heading>
          <Text mt={2} fontSize="sm" color="gray.500">
            Create a new backup, or upload a file to restore the database.
          </Text>
          <HStack mt={4} spacing={4}>
            <Button
              leftIcon={<FaPlus />}
              colorScheme="blue"
              onClick={() => createMutation.mutate()}
              isLoading={createMutation.isPending}
            >
              Create New Backup
            </Button>
            <Button
              leftIcon={<FaUpload />}
              colorScheme="green"
              onClick={() => inputFileRef.current?.click()}
              isLoading={uploadMutation.isPending}
            >
              Upload & Restore
            </Button>
            <input
              type="file"
              accept=".dump"
              ref={inputFileRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </HStack>
        </Box>

        <Divider />

        <Box>
          <Heading size="md">Available Backups</Heading>
          {isLoading && <Spinner mt={4} />}
          {isError && (
            <Text color="red.500" mt={4}>
              Error fetching backups.
            </Text>
          )}
          <List spacing={3} mt={4}>
            {backups &&
              backups.map((file) => (
                <ListItem
                  key={file}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  d="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <HStack>
                    <FaDatabase />
                    <Text>{file}</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      leftIcon={<FaRedo />}
                      onClick={() => handleRestoreClick(file)}
                    >
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<FaTrash />}
                      colorScheme="red"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(file)}
                    >
                      Delete
                    </Button>
                  </HStack>
                </ListItem>
              ))}
            {backups?.length === 0 && !isLoading && (
              <Text mt={4}>No backups found.</Text>
            )}
          </List>
        </Box>
      </VStack>

      {/* Restore Confirmation Modal */}
      <Modal isOpen={isRestoreOpen} onClose={onRestoreClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Restore</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to restore the database from{" "}
              <Tag>{selectedFile}</Tag>?
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
            <Tag mt={2}>{fileToUpload?.name}</Tag>
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
