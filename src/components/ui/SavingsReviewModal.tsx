import { useState, useEffect } from 'react';
import { Button, VStack, Text, Input } from '@chakra-ui/react';
import { useBudgetStore } from '../../store/budgetStore';
import { AppSelect } from './AppSelect';
import { DialogModal } from './DialogModal';

export default function SavingsReviewModal() {
  const savingsGoals = useBudgetStore((s) => s.savingsGoals);
  const addSavingsGoal = useBudgetStore((s) => s.addSavingsGoal);
  const queue = useBudgetStore((s) => s.savingsReviewQueue);
  const addSavingsLog = useBudgetStore((s) => s.addSavingsLog);
  const isOpen = useBudgetStore((s) => s.isSavingsModalOpen);
  const setIsOpen = useBudgetStore((s) => s.setSavingsModalOpen);
  const setConfirm = useBudgetStore((s) => s.setConfirmModalOpen);
  const resolveSavingsLink = useBudgetStore((s) => s.resolveSavingsLink);

  // Track which goal is selected for each entry
  const [selectedGoals, setSelectedGoals] = useState<{ [key: string]: string }>({});
  // Track which entries are creating a new goal
  const [isCreating, setIsCreating] = useState<{ [key: string]: boolean }>({});
  const isAnyCreating = Object.values(isCreating).some(Boolean);
  // Track the text input for new goal names
  const [newGoalNames, setNewGoalNames] = useState<Record<string, { name?: string; target?: string }>>({});

  useEffect(() => {
    setSelectedGoals((prev) => {
      let changed = false;
      const next = { ...prev };
      queue.forEach((entry: any) => {
        if (next[entry.id] !== undefined) return;
        if (typeof entry?.name !== 'string') return;
        if (!entry.name.toLowerCase().includes('yearly')) return;
        const match = savingsGoals.find((g: any) =>
          typeof g?.name === 'string' ? g.name.toLowerCase().includes('yearly') : false
        );
        if (match?.id) {
          next[entry.id] = match.id;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [queue, savingsGoals]);

  const handleChange = (id: string, goalId: string) => {
    if (goalId === '__newGoal') {
      // Switch to create mode for this entry
      setIsCreating(prev => ({ ...prev, [id]: true }));
      setSelectedGoals(prev => ({ ...prev, [id]: '' }));
    } else {
      // Normal selection
      setIsCreating(prev => ({ ...prev, [id]: false }));
      setSelectedGoals(prev => ({ ...prev, [id]: goalId }));
    }
  };

  const handleSaveGoal = (entryId: string) => {
    const goalData = newGoalNames[entryId];
    const name = goalData?.name?.trim();
    const target = goalData?.target ? parseFloat(goalData.target) || 0 : 0;
    if (!name) return;
    const newGoalId = crypto.randomUUID();
    addSavingsGoal({ id: newGoalId, name, target }); // adjust if your goal object has more fields
    // Assign the new goal to this entry
    setSelectedGoals(prev => ({ ...prev, [entryId]: newGoalId }));
    // Clear creation state
    setIsCreating(prev => ({ ...prev, [entryId]: false }));
    setNewGoalNames((prev) => ({ ...prev, [entryId]: {} }));
  };

  const closeConfirm = () => {
    setConfirm(true);
  }

  const handleSubmit = () => {
    queue.forEach((entry: any) => {
      const goalId = selectedGoals[entry.id] || null; // allow null
      addSavingsLog(entry.month, {
        goalId,
        date: entry.date,
        amount: entry.amount,
        name: entry.name,
      });
    });
    // Resolve and cleanup centrally
    resolveSavingsLink(true);
  
  };

  if (!queue.length) return null;

  return (
    <DialogModal
      title='Review Savings Transfers'
      open={isOpen}
      setOpen={setIsOpen}
      onCancel={closeConfirm}
      acceptColorPalette='blue'
      acceptLabel='Confirm'
      onAccept={handleSubmit}
      acceptDisabled={isAnyCreating}
      body={
        <VStack align="stretch" gap={4}>
          {queue.map((entry: any) => (
            <div key={entry.id}>
              <Text>
                  {entry.date} — ${entry.amount.toFixed(2)} — {entry.name}
                </Text>
                <AppSelect
                  placeholder="Don't add to goal"
                  value={selectedGoals[entry.id] || ''}
                  onChange={(e) => handleChange(entry.id, e.target.value)}
                >
                  {savingsGoals.map((goal: any) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.name}
                    </option>
                  ))}
                  <option value="__newGoal">+ Create new goal…</option>
                </AppSelect>

                {isCreating[entry.id] && (
                  <VStack mt={2} align="stretch" gap={2}>
                    <Input
                      placeholder="New goal name"
                      value={newGoalNames[entry.id]?.name || ''}
                      onChange={(e) =>
                        setNewGoalNames((prev) => ({
                          ...prev,
                          [entry.id]: { ...prev[entry.id], name: e.target.value }
                        }))
                      }
                    />
                    <Input
                      placeholder="Target amount"
                      type="number"
                      value={newGoalNames[entry.id]?.target || ''}
                      onChange={(e) =>
                        setNewGoalNames((prev) => ({
                          ...prev,
                          [entry.id]: { ...prev[entry.id], target: e.target.value }
                        }))
                      }
                    />
                    <Button
                      size="sm"
                      colorScheme="teal"
                      onClick={() => handleSaveGoal(entry.id)}
                    >
                      Save
                    </Button>
                  </VStack>
                )}

                <Text fontSize="sm" color="gray.500">
                  Goal: {selectedGoals[entry.id] ? savingsGoals.find(g => g.id === selectedGoals[entry.id])?.name : "None"}
                </Text>
              </div>
            ))}
          </VStack>
        }
      />
  );
}