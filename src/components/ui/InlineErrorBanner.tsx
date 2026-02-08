import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

export function InlineErrorBanner({
  title = "Failed to load",
  message,
  onRetry,
  retryLabel = "Retry",
  secondaryAction,
}: {
  title?: string;
  message?: string | null;
  onRetry?: (() => void) | null;
  retryLabel?: string;
  secondaryAction?: ReactNode;
}) {
  const trimmed = typeof message === "string" ? message.trim() : "";

  return (
    <Box bg="red.50" borderWidth="1px" borderColor="red.200" rounded="md" p={3} w="100%">
      <VStack align="start" gap={2} w="100%">
        <Text color="red.800" fontWeight={700}>
          {title}
        </Text>
        {trimmed ? (
          <Text color="red.700" fontSize="sm">
            {trimmed}
          </Text>
        ) : null}
        {onRetry || secondaryAction ? (
          <HStack gap={2} flexWrap="wrap">
            {onRetry ? (
              <Button size="sm" variant="outline" onClick={onRetry}>
                {retryLabel}
              </Button>
            ) : null}
            {secondaryAction ?? null}
          </HStack>
        ) : null}
      </VStack>
    </Box>
  );
}
