import { Button, Center, Heading, Box, useDisclosure, HStack } from '@chakra-ui/react';
import { Suspense, lazy } from 'react';
import InlineSpinner from '../components/ui/InlineSpinner';
import { useBudgetStore } from "../store/budgetStore";
import AccountCard from '../components/accounts/AccountCard';
import { config } from '../config/theme';
// Dev harness can still be imported manually when needed
// import IngestionDevHarness from '../../dev/IngestionDevHarness';
const ImportTransactionsModal = lazy(() => import('../components/ui/ImportTransactionsModal'));
const preloadImportModal = () => import('../components/ui/ImportTransactionsModal');

const SyncAccountsModal = lazy(() => import('../components/ui/SyncAccountsModal'));
const preloadSyncModal = () => import('../components/ui/SyncAccountsModal');

export default function AccountsTracker() {

  const accounts = useBudgetStore((s) => s.accounts);
  const syncModal = useDisclosure();
  const importModal = useDisclosure();
  const bg = config.theme?.semanticTokens?.colors?.bg.value?.toLocaleString('base'); // use semantic token for background color
  

  return (
    <>
      <Center mb={4}>
        <HStack gap={4}>
          <Button colorScheme="teal" onClick={syncModal.onOpen} onMouseEnter={preloadSyncModal}>
            Sync Accounts
          </Button>
          <Button colorScheme="purple" variant="outline" onClick={importModal.onOpen} onMouseEnter={preloadImportModal} onFocus={preloadImportModal}>
            Import Transactions
          </Button>
        </HStack>
      </Center>
      <Suspense fallback={<InlineSpinner />}>
        <SyncAccountsModal isOpen={syncModal.open} onClose={syncModal.onClose} />
      </Suspense>
      <Suspense fallback={<InlineSpinner />}>
        <ImportTransactionsModal isOpen={importModal.open} onClose={importModal.onClose} />
      </Suspense>
      {/* ...rest of the AccountsTracker UI */}
      {Object.entries(accounts).length > 0 && (
        <Box>
          <Heading size="md" mb={2} mx={4}>Synced Accounts</Heading>

          {Object.entries(accounts).map(([accountNumber, acct]) => {

            return (
              <Box key={accountNumber} borderWidth="1px" borderRadius="lg" p={4} mb={6} mx={4} bg={bg}>
                <AccountCard acct={acct} acctNumber={accountNumber} />
              </Box>
            );
          })}
        </Box>
      )}
    </>
  );
}