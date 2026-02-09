import { Badge, Box, Button, Heading, HStack, Text, VStack, Image } from "@chakra-ui/react";

export function AboutPage() {
  return (
    <VStack align="stretch" gap={6} minH="100%" p={4} bg="white" rounded="md" boxShadow="sm">
      <VStack align="start" gap={2}>
        <Heading size="2xl">About TaskMaster</Heading>
        <Text color="gray.600">
          TaskMaster is a showcase-friendly task app prototype focused on predictable data flow, clean UI patterns,
          and a clear path to an offline-capable architecture.
        </Text>
      </VStack>

      <Box>
        <Heading size="xl" mb={2}>
          Mission
        </Heading>
        <Text color="gray.700">
          Build a “simple to demo, easy to reason about” task app where state is explicit, navigation is deep-linkable,
          and the data layer is boring (in a good way).
        </Text>
      </Box>

      <Box>
        <Heading size="xl" mb={2}>
          App features
        </Heading>
        <VStack align="start" gap={2} color="gray.700">
          <Text>• Inbox triage with overdue / due-soon attention across lists.</Text>
          <Text>• Deep-linkable task navigation via URL-encoded “pane stack” in list details.</Text>
          <Text>• Store-driven task + list CRUD backed by AppSync GraphQL.</Text>
          <Text>• Updates feed with read markers (intentionally local-first UX state for MVP).</Text>
          <Text>• Demo mode and demo data controls for fast, repeatable showcasing.</Text>
          <Text>• Admin-only console for cross-user inspection (read-only by design for MVP).</Text>
          <Text>• User-scoped persistence + TTL cache for fast reloads and less cross-account state leakage on shared devices.</Text>
          <Text>• Consistent loading/error states with friendly inline errors and a Retry path on primary routes.</Text>
        </VStack>
      </Box>

      <Box>
        <Heading size="xl" mb={3}>
          Tech stack
        </Heading>
        <HStack gap={2} flexWrap="wrap">
          <Badge variant="solid" colorPalette="blue">React 19</Badge>
          <Badge variant="solid" colorPalette="blue">TypeScript 5</Badge>
          <Badge variant="solid" colorPalette="purple">Chakra UI 3</Badge>
          <Badge variant="solid" colorPalette="orange">AWS Amplify (Gen 1)</Badge>
          <Badge variant="solid" colorPalette="orange">Cognito</Badge>
          <Badge variant="solid" colorPalette="orange">AppSync GraphQL</Badge>
          <Badge variant="solid" colorPalette="orange">DynamoDB</Badge>
          <Badge variant="solid" colorPalette="green">Zustand</Badge>
          <Badge variant="outline">React Router v7</Badge>
          <Badge variant="outline">Vite 7</Badge>
          <Badge variant="outline">Playwright</Badge>
          <Badge variant="outline">axe-core</Badge>
          <Badge variant="outline">ESLint</Badge>
        </HStack>

        <Box mt={3} color="gray.700">
          <Text>
            Advisor tools used during development (for design review, refactors, and debugging guidance):
          </Text>
          <HStack gap={2} mt={2} flexWrap="wrap">
            <Badge colorPalette="teal" variant="subtle">ChatGPT (advisor)</Badge>
            <Badge colorPalette="teal" variant="subtle">GitHub Copilot (advisor)</Badge>
          </HStack>
        </Box>
      </Box>

      <Box>
        <Heading size="xl" mb={2}>
          Spotlight: the creator
        </Heading>

        <HStack gap={6} align="start" flexWrap="wrap">
          <Box
            w="170px"
            h="168px"
            rounded="full"
            border="4px solid gold"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box
              w="164px"
              h="162px"
              rounded="full"
              border="4px solid black"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box
                w="160px"
                h="160px"
                rounded="full"
                border="3px solid gold"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Image
                  w="100%"
                  h="100%"
                  rounded="full"
                  objectFit="cover"
                  loading="lazy"
                  src="/pics/NickSr-ProfilePic-Formal02.jpg"
                  alt="Photo of Nick Hanson"
                />
              </Box>
            </Box>
          </Box>

          <VStack align="start" gap={2} flex="1" minW="260px">
            <Text>
              <Text as="span" fontWeight="700">
                Created by:
              </Text>{" "}
              Nick Hanson
            </Text>

            <Text>
              <Text as="span" fontWeight="700">
                Email:
              </Text>{" "}
              nick@nickhanson.me
            </Text>

            <Text>
              <Text as="span" fontWeight="700">
                GitHub:
              </Text>{" "}
              @ArchILLtect
            </Text>

            <HStack gap={2} pt={2} flexWrap="wrap">
              <Button asChild variant="outline">
                <a href="mailto:nick@nickhanson.me">Email me</a>
              </Button>
              <Button asChild variant="outline">
                <a href="https://github.com/ArchILLtect" target="_blank" rel="noreferrer">
                  GitHub profile
                </a>
              </Button>
              <Button asChild colorPalette="purple" variant="solid">
                <a href="https://nickhanson.me" target="_blank" rel="noreferrer">
                  Showcase site
                </a>
              </Button>
            </HStack>
          </VStack>
        </HStack>
      </Box>

      <Box>
        <Heading size="xl" mb={2}>
          What’s next
        </Heading>
        <VStack align="start" gap={2} color="gray.700">
          <Text>
            MVP is shipped. Next work focuses on hardening and expanding capability without changing the core architecture.
          </Text>

          <Text>
            Near-term priorities:
          </Text>

          <Box pl={4}>
            <Text>• Deploy-time CSP + baseline security headers (hosting hardening).</Text>
            <Text>• Offline groundwork: IndexedDB cache + an offline mutation queue (post-MVP).</Text>
          </Box>
        </VStack>
      </Box>
    </VStack>
  );
}
