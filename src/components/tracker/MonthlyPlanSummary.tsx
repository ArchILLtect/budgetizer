import { Box, Heading, Stat, StatGroup, Text, useMediaQuery } from "@chakra-ui/react";
import { AppCollapsible } from "../ui/AppCollapsible"
import { useBudgetStore } from '../../store/budgetStore';
import { formatCurrency } from '../../utils/formatters';
import { formatLocalIsoDate } from '../../services/dateTime';

export default function MonthlyPlanSummary() {
  const showPlanInputs = useBudgetStore((s) => s.showPlanInputs);
  const setShowPlanInputs = useBudgetStore((s) => s.setShowPlanInputs);
  const selectedMonth = useBudgetStore((s) => s.selectedMonth);
  const monthlyPlans = useBudgetStore((s) => s.monthlyPlans);
  const plan = monthlyPlans[selectedMonth];
  const estLeftover = plan?.estLeftover ?? 0;

  const [isPortraitWidth] = useMediaQuery(["(max-width: 450px)"]);

  return (
    <Box p={4} boxShadow="md" bg="bg.subtle" borderWidth={2} borderColor="border">
    {plan ? (
      <>
        <AppCollapsible
          title={"Plan Summary"}
          headerCenter={
            plan.createdAt && (
              <Text fontSize="xs" color="fg.muted">
                Plan Created: {formatLocalIsoDate(plan.createdAt)}
              </Text>
            )
          }
          headerRight={
            <Text fontSize="md" color="fg.info" onClick={() => setShowPlanInputs(!showPlanInputs)}>
              {showPlanInputs ? '▲ Hide All Details ▲' : '▼ Show All Details ▼'}
            </Text>
          }
          pxContent={2}
          defaultOpen={showPlanInputs}
          open={showPlanInputs}
          onOpenChange={setShowPlanInputs}
          mt={0}
          mb={0}
        >
          <Box p={4}>
            <Heading m={0}>Coming Soon</Heading>
            <Text fontSize="sm" color="fg.muted" mb={2}>
              This summary is based on the plan you set for this month. You can adjust your plan inputs on the Planner page, and this summary will update accordingly.
            </Text>
            <Text fontSize="sm" color="fg.muted">
              We’ll be adding more features and insights here soon, such as adjusting your plan and seeing how it affects your overall financial picture.
            </Text>
          </Box>
        </AppCollapsible>

        <Box px={4} py={3} borderWidth={1} borderColor="border" borderRadius="md" bg="bg.panel">
          <StatGroup>
            <Stat.Root textAlign={'center'}>
                <Stat.Label fontSize={isPortraitWidth ? "xs" : "sm"}>Planned Net Income</Stat.Label>
              <Stat.ValueText color="teal.500" fontSize={isPortraitWidth ? "md" : "2xl"}>{formatCurrency(plan.netIncome)}</Stat.ValueText>
            </Stat.Root>

            <Stat.Root textAlign={'center'}>
                <Stat.Label fontSize={isPortraitWidth ? "xs" : "sm"}>Planned Expenses</Stat.Label>
              <Stat.ValueText color="orange.500" fontSize={isPortraitWidth ? "md" : "2xl"}>{formatCurrency(plan.totalExpenses)}</Stat.ValueText>
            </Stat.Root>

            <Stat.Root textAlign="center">
              <Stat.Label fontSize={isPortraitWidth ? "xs" : "sm"}>Planned Savings</Stat.Label>
              <Stat.ValueText color="blue.500" fontSize={isPortraitWidth ? "md" : "2xl"}>
                {Number(plan.totalSavings) > 0 ? formatCurrency(plan.totalSavings) : '--'}
              </Stat.ValueText>
            </Stat.Root>

            <Stat.Root textAlign={'center'}>
                <Stat.Label fontSize={isPortraitWidth ? "xs" : "sm"}>Planned Leftover</Stat.Label>
                <Stat.ValueText color={estLeftover >= 0 ? "green.500" : "red.500"} fontSize={isPortraitWidth ? "md" : "2xl"}>
                  {formatCurrency(estLeftover)}
                </Stat.ValueText>
            </Stat.Root>
          </StatGroup>
        </Box>
      </>
    ) : (
      <Text fontSize="sm" color="fg.muted" textAlign="center" py={6}>
        No plan set for this month.
      </Text>
    )}
    </Box>
  );
}