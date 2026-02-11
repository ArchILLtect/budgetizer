import { Outlet } from "react-router-dom";
import { Box, Flex, Link } from "@chakra-ui/react";
import { Toaster } from "../components/ui/Toaster";
import { StorageDisclosureBanner } from "../components/ui/StorageDisclosureBanner.tsx";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import { ErrorBoundary } from "./ErrorBoundary.tsx";
import type { AuthUserLike } from "../types";
import { Suspense } from "react";
import { BasicSpinner } from "../components/ui/BasicSpinner.tsx";
import { useBootstrapUserProfile } from "../hooks/useBootstrapUserProfile";
import { WelcomeModal } from "../components/ui/WelcomeModal";
import { Sidebar } from "./Sidebar.tsx";
import { PublicSidebar } from "./PublicSidebar.tsx";

type AppShellProps = {
  user?: AuthUserLike | null;
  onSignOut?: () => void;
  signedIn: boolean;
  authLoading: boolean;
};


export function AppShell({ user, onSignOut, signedIn, authLoading }: AppShellProps) {

  useBootstrapUserProfile(user);

  return (
    <Flex direction="column" h="100vh" bg="gray.50" overflow={"hidden"} className="AppShell" position="relative">
      <Link
        href="#main-content"
        position="absolute"
        left={2}
        top={2}
        px={3}
        py={2}
        bg="white"
        borderWidth="1px"
        borderColor="blue.200"
        rounded="md"
        boxShadow="sm"
        zIndex={9999}
        transform="translateY(-200%)"
        _focusVisible={{ transform: "translateY(0)", outline: "2px solid", outlineColor: "blue.400" }}
      >
        Skip to content
      </Link>
      <Toaster />
      <WelcomeModal signedIn={signedIn && !authLoading} />

      <Header user={user}/>

      {/* Body: sidebar + main */}
      {/* Sidebar */}
      <Flex flex="1" minH={0} overflow={"hidden"}>
        {/* Sidebar stays visible, its own scroll if needed */}
        <Box
          flexShrink={0}
          h="100%"
          overflowY="auto"
          borderRightWidth="1px"
        >
          {authLoading ? (
            <Box w={"25vh"} h="100%">
              <BasicSpinner height="100%" width="100%" size="md" />
            </Box>
          ) : signedIn ? (
            <Sidebar />
          ) : (
            <PublicSidebar />
          )}
        </Box>

        {/* Main area is the primary scroll container */}
        <Box flex="1" minW={0} h="100%" overflow="auto" className="Main" id="main-content" tabIndex={-1}>
          <ErrorBoundary title="Page Crashed">
            <Suspense fallback={<BasicSpinner />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </Box>
      </Flex>

      <StorageDisclosureBanner />
      <Footer signedIn={signedIn} onSignOut={onSignOut} />
    </Flex>
  );
}