import { Badge, Box, Button, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
//import { signIn } from "aws-amplify/auth";
//import { createDemoCredentials } from "../services/demoAuthService";
//import { clearDemoSessionActive, setDemoSessionActive } from "../services/demoSession";
import { Tip } from "../components/ui/Tip";
//import { DemoConfirmDialog } from "../components/ui/DemoConfirmDialog";
import { VisuallyHidden } from "@chakra-ui/react";
//import { BudgeteerLogo } from "../components/icons/BudgeteerLogo.svg";
//import homeBannerSvg from "../assets/home-banner.svg?raw";

/*
function sanitizeRedirect(raw: string | null): string {
  if (!raw) return "/today";
  if (!raw.startsWith("/")) return "/today";
  if (raw.startsWith("//")) return "/today";
  if (raw.includes("://")) return "/today";
  return raw;
}*/

export function HomePage({ signedIn }: { signedIn: boolean }) {
  const navigate = useNavigate();
  //const location = useLocation();

  /*
  const redirectTarget = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return sanitizeRedirect(params.get("redirect"));
  }, [location.search]);

  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [demoDialogOpen, setDemoDialogOpen] = useState(false);

  const onTryDemo = async () => {
    if (demoLoading) return;

    setDemoLoading(true);
    setDemoError(null);

    try {
      const creds = await createDemoCredentials();

      // Gotcha guardrail: do not rely on `cognito:groups` being present on the first token.
      // Treat this session as demo based on the fact it was created through `/auth/demo`.
      setDemoSessionActive();

      await signIn({ username: creds.username, password: creds.password });

      navigate(redirectTarget || "/today", { replace: true });
    } catch (err) {
      // If something failed after we marked the session as demo, clear it to avoid confusing UX.
      clearDemoSessionActive();
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: unknown }).message)
          : "Failed to create demo account.";
      setDemoError(message);
    } finally {
      setDemoLoading(false);
    }
  };*/

  return (
    <VStack align="stretch" gap={6} minH="100%" p={4}>
      <Box
        p={8}
        bg="white"
        rounded="md"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.200"
      >
        <VStack align="start" gap={4}>
          <Box
            w="full"
            h={{ base: "120px", md: "140px" }}
            rounded="lg"
            borderWidth="1px"
            borderColor="gray.100"
            overflow="hidden"
            //dangerouslySetInnerHTML={{ __html: homeBannerSvg }}
          />

          <HStack gap={3} align="center">
            <Badge colorPalette="purple" variant="solid">
              Portfolio build
            </Badge>
            <Badge variant="outline">Amplify + AppSync</Badge>
            <Badge variant="outline">Zustand</Badge>
          </HStack>

          <Box aria-hidden="true">
            {/* <BudgeteerLogo /> */}
          </Box>

          <VisuallyHidden>
            <h1>TaskMaster</h1>
          </VisuallyHidden>
          <Tip storageKey="tip:home-deeplinks" title="Tip">
            Most pages support deep links. If someone shares a task or list URL, logging in will bring you right back to
            that context.
          </Tip>
          <Text color="gray.600" fontSize="lg" maxW="2xl">
            A fast, store-driven task app prototype with deep-linkable task navigation, a user-scoped local cache + TTL refresh,
            and a guided Admin console for cross-user inspection.
          </Text>

          <HStack gap={3} pt={2} flexWrap="wrap">
            {/*!signedIn ? (
              <Button
                size="lg"
                colorPalette="purple"
                onClick={() => {
                  setDemoError(null);
                  setDemoDialogOpen(true);
                }}
                loading={demoLoading}
                disabled={demoLoading}
              >
                {demoLoading ? "Creating demo account…" : "Try Demo (No Signup)"}
              </Button>
            ) : null*/}

            <Button
              size="lg"
              variant={signedIn ? "solid" : "outline"}
              colorPalette={signedIn ? "green" : undefined}
              onClick={() => navigate(signedIn ? "/today" : "/login")}
            >
              {signedIn ? "Go to your tasks" : "Sign in / Create account"}
            </Button>

            <Button size="lg" variant="ghost" onClick={() => navigate("/about")}
            >
              About
            </Button>
          </HStack>

          {/*!signedIn ? (
            <Box pt={2} color="gray.600">
              {demoError ? (
                <Box p={3} bg="red.50" borderWidth="1px" borderColor="red.200" rounded="md" mb={3}>
                  <Text fontWeight="600" color="red.800">
                    Demo sign-in failed
                  </Text>
                  <Text fontSize="sm" color="red.700">
                    {demoError}
                  </Text>
                </Box>
              ) : null}

              <Text fontSize="sm">
                Demo mode: one click creates a temporary demo user, signs you in, and seeds data.
              </Text>
              <Text fontSize="sm">
                No signup. No email. Takes ~5 seconds.
              </Text>
              <Text fontSize="sm">
                Local state is scoped per user to prevent cross-account mixing on shared browsers.
              </Text>
            </Box>
          ) : null*/}
        </VStack>
      </Box>

      {/*!signedIn ? (
        <DemoConfirmDialog
          open={demoDialogOpen}
          setOpen={setDemoDialogOpen}
          loading={demoLoading}
          error={demoError}
          onConfirm={async () => {
            await onTryDemo();
          }}
        />
      ) : null*/}

      <HStack gap={4} align="stretch" flexWrap="wrap">
        <Box flex="1" minW="280px" p={5} bg="white" rounded="md" boxShadow="sm">
          <Heading size="md" mb={2}>
            Pane-stack navigation
          </Heading>
          <Text color="gray.600">
            List details use a URL-encoded “pane stack” so task context is shareable and refresh-safe.
          </Text>
        </Box>

        <Box flex="1" minW="280px" p={5} bg="white" rounded="md" boxShadow="sm">
          <Heading size="md" mb={2}>
            Store-driven UI
          </Heading>
          <Text color="gray.600">
            Reads go through Zustand selectors; writes go through store actions → GraphQL wrapper → AppSync.
          </Text>
        </Box>

        <Box flex="1" minW="280px" p={5} bg="white" rounded="md" boxShadow="sm">
          <Heading size="md" mb={2}>
            Fast reloads
          </Heading>
          <Text color="gray.600">
            A persisted local cache with TTL renders immediately and refreshes in the background.
          </Text>
        </Box>

        <Box flex="1" minW="280px" p={5} bg="white" rounded="md" boxShadow="sm">
          <Heading size="md" mb={2}>
            User-scoped persistence
          </Heading>
          <Text color="gray.600">
            Persisted UI state is namespaced per account, so signing in/out on a shared device doesn’t leak or mix data.
          </Text>
        </Box>
      </HStack>
    </VStack>
  );
}
