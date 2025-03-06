import React, { useState, useRef } from 'react'
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

const CreateLedgerModal = ({ isOpen, onClose, handleCreateLedger }) => {

  const [newLedgerName, setNewLedgerName] = useState('')
  const [newLedgerCurrency, setNewLedgerCurrency] = useState('')
  const ledgerNameInputRef = useRef(null)
  const toast = useToast()

  const handleSubmit = () => {
    if (!newLedgerName || !newLedgerCurrency) {
      toast({
        title: 'Error',
        description: 'All fields are required.',
        status: 'error',
        duration: 2000,
        position: 'top-right',
        isClosable: true,
      })
      ledgerNameInputRef.current?.focus()
      return
    }

    // Call the handleCreateLedger function passed from the parent
    handleCreateLedger(newLedgerName, newLedgerCurrency)

    // Reset the form fields
    setNewLedgerName('')
    setNewLedgerCurrency('')

    // Close the modal
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={ledgerNameInputRef}>
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
          <Button mr={3} onClick={handleSubmit}>
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
