import { Text, Box, HStack, Collapsible, Grid, Icon } from "@chakra-ui/react";
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from "react-icons/md";
import { useState, type ReactNode } from "react";

type AppCollapsibleProps = {
  title: ReactNode;
  ariaLabel?: string;
  headerCenter?: ReactNode;
  fontSize?: string;
  fontWeight?: string;
  fontColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  width?: string | number;
  mt?: string | number;
  mb?: string | number;
};

export function AppCollapsible({ title, ariaLabel, headerCenter, fontSize = "lg", fontWeight = "600", fontColor = "black", children, defaultOpen = false, width = "100%", mt = "5", mb = "5" }: AppCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <Collapsible.Root
      defaultOpen={defaultOpen}
      w={width}
      mt={mt}
      mb={mb}
      onOpenChange={(e) => setIsOpen(e.open)}
    >
      <Collapsible.Trigger asChild>
        <Box
          as="button"
          w="100%"
          bg="transparent"
          border="0"
          cursor="pointer"
          aria-label={ariaLabel ?? "Toggle section"}
          _focusVisible={{ outline: "2px solid", outlineColor: "blue.400", outlineOffset: "2px", borderRadius: "md" }}
        >
          <Grid
            p="1"
            userSelect="none"
            rounded="md"
            _hover={{ bg: "blackAlpha.50" }}
            alignItems="center"
            templateColumns="1fr auto 1fr"
            gap={2}
          >
            {/* LEFT */}
            <HStack align="center" gap={2}>
              {typeof title === "string" ? (
                <Text fontSize={fontSize} fontWeight={fontWeight} color={fontColor}>
                  {title}
                </Text>
              ) : (
                <Box fontSize={fontSize} fontWeight={fontWeight} color={fontColor}>
                  {title}
                </Box>
              )}
            </HStack>

            {/* CENTER (interactive content should NOT toggle collapse) */}
            {headerCenter ? (
              <Box
                justifySelf="center"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerDownCapture={(e) => e.stopPropagation()}
              >
                {headerCenter}
              </Box>
            ) : (
              <Box />
            )}

            {/* RIGHT */}
            <Box justifySelf="end" />
          </Grid>

          <Box w="100%" display="flex" justifyContent="center">
            {isOpen ? <Icon as={MdOutlineKeyboardArrowDown} /> : <Icon as={MdOutlineKeyboardArrowUp} />}
          </Box>
        </Box>
      </Collapsible.Trigger>
      <Collapsible.Content>
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}