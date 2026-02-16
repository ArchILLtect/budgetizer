import { Text, Box, HStack, Collapsible, Grid, Icon } from "@chakra-ui/react";
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from "react-icons/md";
import { useState, type ReactNode } from "react";

type AppCollapsibleProps = {
  title?: ReactNode;
  ariaLabel?: string;
  headerCenter?: ReactNode;
  headerRight?: ReactNode;
  midChevronToggler?: ReactNode; // if provided, will show a toggler in the middle of the header instead of the right
  fontSize?: string;
  fontWeight?: string;
  fontColor?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  width?: string | number;
  mt?: string | number;
  mb?: string | number;
};

export function AppCollapsible({ title, ariaLabel, headerCenter, headerRight, midChevronToggler, fontSize = "lg", fontWeight = "600", fontColor = "fg", children, defaultOpen = false, open, onOpenChange, width = "100%", mt = "5", mb = "5" }: AppCollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;
  return (
    <Collapsible.Root
      {...(open != null ? { open } : { defaultOpen })}
      w={width}
      mt={mt}
      mb={mb}
      onOpenChange={(e) => {
        if (open == null) setUncontrolledOpen(e.open);
        onOpenChange?.(e.open);
      }}
    >
      <Collapsible.Trigger asChild>
        <Box
          as="button"
          w="100%"
          mb={2}
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
            {title ? (
              <HStack align="center" gap={2} px={"10px"}>
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
            ) : (
              <Box />
            )}

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
            {headerRight ? (
              <Box
                justifySelf="end"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerDownCapture={(e) => e.stopPropagation()}
              >
                {headerRight}
              </Box>
            ) : (
              <Box />
            )}
          </Grid>
          {/* TODO(P4): Add carry-over for centered show/hide toggle display */} 
          {midChevronToggler &&
            <Box w="100%" display="flex" justifyContent="center">
              {isOpen ? <Icon as={MdOutlineKeyboardArrowDown} /> : <Icon as={MdOutlineKeyboardArrowUp} />}
            </Box>
          }
        </Box>
      </Collapsible.Trigger>
      <Collapsible.Content px="4">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}