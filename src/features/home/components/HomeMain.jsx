import React from 'react'
import HomeLedgerCards from '@features/home/components/HomeLedgerCards'
import CreateLedgerModal from '@components/modals/CreateLedgerModal'

const HomeMain = ({
  ledgers = [],
  onOpen,
  isOpen,
  onClose,
  handleCreateLedger,
}) => {
  return (
    <>
      <HomeLedgerCards ledgers={ledgers} onOpen={onOpen} />
      <CreateLedgerModal
        isOpen={isOpen}
        onClose={onClose}
        handleCreateLedger={handleCreateLedger}
      />
    </>
  )
}

export default HomeMain
