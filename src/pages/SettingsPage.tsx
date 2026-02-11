import { useState, useEffect } from 'react';
import { useBudgetStore } from '../store/budgetStore';
import { Box, Heading, NumberInput, HStack, Button, VStack, Text, Badge, Flex, Field, Separator } from '@chakra-ui/react';
import { AppSwitch } from '../components/Switch';
import { fireToast } from "../hooks/useFireToast";

export default function SettingsPage() {
  // Subscribe to primitives individually to avoid new object identity every render
  const importUndoWindowMinutes = useBudgetStore(s => s.importUndoWindowMinutes);
  const importHistoryMaxEntries = useBudgetStore(s => s.importHistoryMaxEntries);
  const importHistoryMaxAgeDays = useBudgetStore(s => s.importHistoryMaxAgeDays);
  const stagedAutoExpireDays = useBudgetStore(s => s.stagedAutoExpireDays);
  const streamingAutoLineThreshold = useBudgetStore(s => s.streamingAutoLineThreshold);
  const streamingAutoByteThreshold = useBudgetStore(s => s.streamingAutoByteThreshold);
  const showIngestionBenchmark = useBudgetStore(s => s.showIngestionBenchmark);
  const setShowIngestionBenchmark = useBudgetStore(s => s.setShowIngestionBenchmark);
  const updateImportSettings = useBudgetStore(s => s.updateImportSettings);
  const pruneImportHistory = useBudgetStore(s => s.pruneImportHistory);
  const expireOldStagedTransactions = useBudgetStore(s => s.expireOldStagedTransactions);
  const [local, setLocal] = useState({
    importUndoWindowMinutes: importUndoWindowMinutes ?? 30,
    importHistoryMaxEntries: importHistoryMaxEntries ?? 30,
    importHistoryMaxAgeDays: importHistoryMaxAgeDays ?? 30,
    stagedAutoExpireDays: stagedAutoExpireDays ?? 30,
    streamingAutoLineThreshold: streamingAutoLineThreshold ?? 3000,
    streamingAutoByteThreshold: streamingAutoByteThreshold ?? 500000,
  });

  // Sync from store if external changes occur (e.g., another tab or reset) without causing loops
  useEffect(() => {
    setLocal((prev: any) => {
      const next = {
        importUndoWindowMinutes: importUndoWindowMinutes ?? prev.importUndoWindowMinutes,
        importHistoryMaxEntries: importHistoryMaxEntries ?? prev.importHistoryMaxEntries,
        importHistoryMaxAgeDays: importHistoryMaxAgeDays ?? prev.importHistoryMaxAgeDays,
        stagedAutoExpireDays: stagedAutoExpireDays ?? prev.stagedAutoExpireDays,
        streamingAutoLineThreshold: streamingAutoLineThreshold ?? prev.streamingAutoLineThreshold,
        streamingAutoByteThreshold: streamingAutoByteThreshold ?? prev.streamingAutoByteThreshold,
      } as any;
      // shallow compare
      const same = Object.keys(next).every((k) => next[k] === prev[k]);
      return same ? prev : next;
    });
  }, [importUndoWindowMinutes, importHistoryMaxEntries, importHistoryMaxAgeDays, stagedAutoExpireDays, streamingAutoLineThreshold, streamingAutoByteThreshold]);

  const onChange = (field: keyof typeof local, _valueString: string, valueNumber: number) => {
    if (Number.isNaN(valueNumber)) return;
    setLocal(l => ({ ...l, [field]: valueNumber }));
  };

  const save = () => {
    if (!hasChanges) {
      fireToast("info", "No changes to save", "There are no changes to save.");
      return;
    }
    updateImportSettings({ ...local });
    if (importHistoryMaxEntries !== local.importHistoryMaxEntries || importHistoryMaxAgeDays !== local.importHistoryMaxAgeDays) {
      pruneImportHistory();
    }
    if (stagedAutoExpireDays !== local.stagedAutoExpireDays) {
      expireOldStagedTransactions();
    }
    fireToast('success', 'Settings saved', 'Your settings have been saved successfully.');
  };

  const hasChanges = (
    importUndoWindowMinutes !== local.importUndoWindowMinutes ||
    importHistoryMaxEntries !== local.importHistoryMaxEntries ||
    importHistoryMaxAgeDays !== local.importHistoryMaxAgeDays ||
    stagedAutoExpireDays !== local.stagedAutoExpireDays ||
    streamingAutoLineThreshold !== local.streamingAutoLineThreshold ||
    streamingAutoByteThreshold !== local.streamingAutoByteThreshold
  );

  const policySummary = `Keeps up to ${local.importHistoryMaxEntries} sessions for ${local.importHistoryMaxAgeDays} days (whichever is stricter). Staged transactions auto-apply after ${local.stagedAutoExpireDays} day(s). Undo window: ${local.importUndoWindowMinutes} minute(s).`;
  const streamingSummary = `Auto-stream when > ${local.streamingAutoLineThreshold.toLocaleString()} lines or > ${(local.streamingAutoByteThreshold/1024).toFixed(0)} KB.`;

  return (
    <Box p={6} maxW="700px" mb={20}>
      <Heading size='md' mb={4}>Import & Staging Settings</Heading>
      <Box mb={6} p={3} borderWidth={1} borderRadius='md' bg='gray.50'>
        <Flex wrap='wrap' gap={2} mb={1}>
          <Badge colorScheme='teal'>Undo {local.importUndoWindowMinutes}m</Badge>
          <Badge colorScheme='purple'>History {local.importHistoryMaxEntries} max</Badge>
          <Badge colorScheme='purple'>History {local.importHistoryMaxAgeDays}d age</Badge>
          <Badge colorScheme='orange'>Auto-expire {local.stagedAutoExpireDays}d</Badge>
        </Flex>
        <Text fontSize='xs' color='gray.600'>{policySummary}</Text>
      </Box>
      <VStack align='stretch' gap={5} separator={<Separator />}>
        <Field.Root>
          <Field.Label>Undo Window (minutes)</Field.Label>
          <NumberInput.Root
            value={String(local.importUndoWindowMinutes)}
            onValueChange={(details) =>
              onChange("importUndoWindowMinutes", details.value, details.valueAsNumber)
            }
          >
            <NumberInput.Input min={1} max={720} />
          </NumberInput.Root>
          <Text fontSize='xs' color='gray.500'>How long after import sessions can be undone.</Text>
        </Field.Root>
        <Field.Root>
          <Field.Label>Streaming Auto Line Threshold</Field.Label>
            <NumberInput.Root
              value={String(local.streamingAutoLineThreshold)}
              onValueChange={(details) =>
                onChange("streamingAutoLineThreshold", details.value, details.valueAsNumber)
              }
            >
              <NumberInput.Input min={500} max={200000} step={100} />
            </NumberInput.Root>
            <Text fontSize='xs' color='gray.500'>If a CSV exceeds this many lines, streaming parser auto-enables.</Text>
        </Field.Root>
        <Field.Root>
          <Field.Label>Streaming Auto Size Threshold (KB)</Field.Label>
            <NumberInput.Root
              value={String(Math.round(local.streamingAutoByteThreshold / 1024))}
              onValueChange={(details) =>
                onChange(
                  "streamingAutoByteThreshold",
                  details.value,
                  details.valueAsNumber * 1024
                )
              }
            >
              <NumberInput.Input min={50} max={20480} step={50} />
            </NumberInput.Root>
            <Text fontSize='xs' color='gray.500'>If file size exceeds this value, streaming parser auto-enables.</Text>
        </Field.Root>
        <Field.Root>
          <Field.Label>Import History Max Entries</Field.Label>
            <NumberInput.Root
              value={String(local.importHistoryMaxEntries)}
              onValueChange={(details) =>
                onChange("importHistoryMaxEntries", details.value, details.valueAsNumber)
              }
            >
              <NumberInput.Input min={5} max={500} />
            </NumberInput.Root>
            <Text fontSize='xs' color='gray.500'>Newest sessions kept; older pruned beyond this count.</Text>
        </Field.Root>
        <Field.Root>
          <Field.Label>Import History Max Age (days)</Field.Label>
            <NumberInput.Root
              value={String(local.importHistoryMaxAgeDays)}
              onValueChange={(details) =>
                onChange("importHistoryMaxAgeDays", details.value, details.valueAsNumber)
              }
            >
              <NumberInput.Input min={1} max={365} />
            </NumberInput.Root>
            <Text fontSize='xs' color='gray.500'>Sessions older than this may be pruned.</Text>
        </Field.Root>
        <Field.Root>
          <Field.Label>Auto-Expire Staged Sessions (days)</Field.Label>
            <NumberInput.Root
              value={String(local.stagedAutoExpireDays)}
              onValueChange={(details) =>
                onChange("stagedAutoExpireDays", details.value, details.valueAsNumber)
              }
            >
              <NumberInput.Input min={1} max={120} />
            </NumberInput.Root>
            <Text fontSize='xs' color='gray.500'>Staged transactions auto-applied after this age.</Text>
        </Field.Root>
        <HStack gap={3} flexWrap='wrap'>
          <Button colorScheme='teal' onClick={save} disabled={!hasChanges}>Save</Button>
          <Button variant='outline' onClick={()=> setLocal({
            importUndoWindowMinutes: importUndoWindowMinutes ?? 30,
            importHistoryMaxEntries: importHistoryMaxEntries ?? 30,
            importHistoryMaxAgeDays: importHistoryMaxAgeDays ?? 30,
            stagedAutoExpireDays: stagedAutoExpireDays ?? 30,
            streamingAutoLineThreshold: streamingAutoLineThreshold ?? 3000,
            streamingAutoByteThreshold: streamingAutoByteThreshold ?? 500000,
          })}>Reset</Button>
          <Button size='sm' variant='ghost' onClick={() => { pruneImportHistory(); fireToast('success', 'History pruned', 'Import history has been pruned successfully.'); }}>Prune Now</Button>
          <Button size='sm' variant='ghost' onClick={() => { expireOldStagedTransactions(); fireToast('success', 'Expired staged processed', 'Old staged transactions have been expired successfully.'); }}>Force Expire</Button>
        </HStack>
      </VStack>
      <Box mt={6} p={3} borderWidth={1} borderRadius='md' bg='purple.50'>
        <Heading size='sm' mb={2}>Streaming Auto-Toggle</Heading>
        <Text fontSize='xs' color='gray.700'>{streamingSummary}</Text>
      </Box>
      {import.meta.env.DEV && (
        <Box mt={6} p={3} borderWidth={1} borderRadius='md' bg='gray.50'>
          <Heading size='sm' mb={2}>Developer / Debug</Heading>
          <HStack justify='space-between'>
            <Text fontSize='sm'>Show Ingestion Benchmark Panel</Text>
            {/* <Switch size='md' isChecked={showIngestionBenchmark} onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setShowIngestionBenchmark(e.target.checked)} /> */}
            <AppSwitch show={showIngestionBenchmark} setShow={setShowIngestionBenchmark} />
          </HStack>
          <Text fontSize='xs' mt={2} color='gray.500'>Dev-only synthetic ingestion performance harness. Not persisted.</Text>
        </Box>
      )}
    </Box>
  );
}
