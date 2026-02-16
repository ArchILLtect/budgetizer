import { Button, HStack, Text } from '@chakra-ui/react';
import { RouterLink } from '../components/RouterLink';

type FooterProps = {
  signedIn: boolean;
  onSignOut?: () => void;
};

export default function Footer({ signedIn, onSignOut }: FooterProps) {
  return (
    <HStack
      justify="space-around"
      flexWrap="wrap"
      py={2}
      bg={{ base: "teal.300", _dark: "teal.700" }}
    >
      <Text textAlign="center" color="fg" fontSize="sm">
        &copy; {new Date().getFullYear()} Budgeteer. A privacy-aware personal finance app.
      </Text>
      <HStack gap={4} justify="center" flexWrap="wrap">
        <Button
          asChild
          size="sm"
          textAlign="center"
          variant="ghost"
          color="gray.800"
          bg={"gray.300"}
          _hover={{ color: "gray.300", bg: "gray.800" }}
        >
          <a href="https://nickhanson.me" target="_blank" rel="noreferrer">
            Showcase Site
          </a>
        </Button>

        {signedIn ? (
          <Button
            size="sm"
            variant="outline"
            textAlign="center"
            fontWeight={"700"}
            pb={1}
            bg={"teal.300"}
            _hover={{ bg: "teal.700", color: "white", borderColor: "teal.300" }}
            onClick={onSignOut}
          >
            Sign out
          </Button>
        ) : (
          <RouterLink to="/login">
            {() => (
              <Button
                as="span"
                size="sm"
                variant="outline"
                borderColor={"teal.800"}
                fontWeight={"500"}
                pb={1}
                bg={"teal.300"}
                _hover={{ bg: "teal.700", color: "white", borderColor: "teal.300" }}
              >
                Sign in
              </Button>
            )}
          </RouterLink>
        )}
      </HStack>
    </HStack>
  );
}
