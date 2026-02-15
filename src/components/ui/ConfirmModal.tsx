import { Text } from '@chakra-ui/react';
import { useBudgetStore } from '../../store/budgetStore';
import { DialogModal } from './DialogModal';

export default function ConfirmModal() {

  const isOpen = useBudgetStore((s) => s.isConfirmModalOpen);
  const setIsOpen = useBudgetStore((s) => s.setConfirmModalOpen);
  const clearQueue = useBudgetStore((s) => s.clearSavingsReviewQueue);
  const resolveSavingsLink = useBudgetStore((s) => s.resolveSavingsLink);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = () => {
    setIsOpen(false);
    clearQueue();
    resolveSavingsLink(false);
  };

  return (
    <DialogModal
      title="Confirm Cancel Process"
      open={isOpen}
      setOpen={handleClose}
      initialFocus="cancel"
      enterKeyAction="cancel"
      onAccept={handleSubmit}
      onCancel={handleClose}
      body={
        <>
          <Text>Exiting this window will cancel all pending actions.</Text>
          <Text>Are you sure you wish to proceed?</Text>
        </>
      }
    />
  );
}