import { Box, Text } from "@chakra-ui/react";
import { useBudgetStore } from "../../store/budgetStore";
import RecurringPaymentsCard from "./RecurringPaymentsCard";
import { AppCollapsible } from "../ui/AppCollapsible";
import type { Account } from "../../types";

export default function RecurringManager() {

  const showRecurringTXs = useBudgetStore((s) => s.showRecurringTXs);
  const setShowRecurringTXs = useBudgetStore((s) => s.setShowRecurringTXs);
  const accounts = useBudgetStore((s) => s.accounts);

  return (
    <Box mt={6} p={4} borderWidth="1px" borderColor="border" borderRadius="lg" bg="bg.panel" boxShadow="md">
      
      <AppCollapsible
        title="Recurring Payments"
        headerRight={
          <Text fontSize="md" color="fg.info" ml={2} onClick={() => setShowRecurringTXs(!showRecurringTXs)}>
            {showRecurringTXs ? '▲ Hide All Transactions ▲' : '▼ Show All Transactions ▼'}
          </Text>
        }
        mb={4}
        open={showRecurringTXs}
        onOpenChange={setShowRecurringTXs}
      >
        {accounts && Object.keys(accounts).length > 0 ? (
          <>
            {(Object.values(accounts) as Account[]).map((account, idx) => (
              <Box key={account.id ?? account.accountNumber ?? idx} mt={4} color="fg.muted">
                <RecurringPaymentsCard account={account} />
              </Box>
            ))}
          </>
        ) : (
          <Box mt={4} color="fg.muted">
            No accounts found. Please add an account to manage recurring payments.
          </Box>
        )}
      </AppCollapsible>
    </Box>
  );
}