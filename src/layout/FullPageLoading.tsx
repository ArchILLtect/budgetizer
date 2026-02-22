import { Box, Text, VStack } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { BasicSpinner } from "../components/ui/BasicSpinner";

function formatElapsedMs(ms: number): string {
  const safe = Number.isFinite(ms) && ms >= 0 ? ms : 0;
  if (safe < 1000) return `${Math.round(safe)}ms`;
  return `${(safe / 1000).toFixed(1)}s`;
}

export function FullPageLoading({
  label = "Loading…",
  destination,
  startedAtMs,
}: {
  label?: string;
  destination?: string | null;
  startedAtMs?: number | null;
}) {
  const startedAt = startedAtMs ?? null;
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [startedAt]);

  const elapsedLabel = useMemo(() => {
    if (!startedAt) return "—";
    return formatElapsedMs(nowMs - startedAt);
  }, [nowMs, startedAt]);

  return (
    <Box w="full" h="full" minH="100%" px={4} py={8} bg="bg.subtle">
      <VStack gap={4} align="center" justify="center" minH="60vh">
        <BasicSpinner height="auto" width="auto" size="xl" />
        <Text fontSize="sm" color="fg.muted">
          {label}
        </Text>
        <VStack gap={1} align="center">
          <Text fontSize="xs" color="fg.muted">
            Destination: {destination ? destination : "—"}
          </Text>
          <Text fontSize="xs" color="fg.muted">
            Loading Time: {elapsedLabel}
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
}
