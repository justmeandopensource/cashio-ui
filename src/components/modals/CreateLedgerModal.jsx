import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  Input,
  Button,
  useToast,
} from '@chakra-ui/react'

const CreateLedgerModal = ({
  isOpen,
  onClose,
  newLedgerName,
  setNewLedgerName,
  newLedgerCurrency,
  setNewLedgerCurrency,
  handleCreateLedger,
  ledgerNameInputRef,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Ledger</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Input
              placeholder="Ledger Name"
              value={newLedgerName}
              onChange={(e) => setNewLedgerName(e.target.value)}
              autoFocus
              ref={ledgerNameInputRef}
            />
            <Input
              placeholder="Currency Symbol"
              value={newLedgerCurrency}
              onChange={(e) => setNewLedgerCurrency(e.target.value)}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={handleCreateLedger}>
            Create
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default CreateLedgerModal
