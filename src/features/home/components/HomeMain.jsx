import React from 'react'
import HomeLedgerCards from '@features/home/components/HomeLedgerCards'
import CreateLedgerModal from '@components/modals/CreateLedgerModal'

const HomeMain = ({
  ledgers,
  onOpen,
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
    <>
      <HomeLedgerCards ledgers={ledgers} onOpen={onOpen} />
      <CreateLedgerModal
        isOpen={isOpen}
        onClose={onClose}
        newLedgerName={newLedgerName}
        setNewLedgerName={setNewLedgerName}
        newLedgerCurrency={newLedgerCurrency}
        setNewLedgerCurrency={setNewLedgerCurrency}
        handleCreateLedger={handleCreateLedger}
        ledgerNameInputRef={ledgerNameInputRef}
      />
    </>
  )
}

export default HomeMain
