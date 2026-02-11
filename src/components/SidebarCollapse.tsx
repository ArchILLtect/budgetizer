import { Box, Collapsible, VStack, HStack } from "@chakra-ui/react";
import { SidebarItem } from "./SidebarItem";
import { FiChevronDown } from "react-icons/fi";

type SidebarCollapseProps = {
  label: string;
  to: string;
  items: { to: string; label: string }[];
  defaultOpen?: boolean;
};

export const SidebarCollapse = ({ to, label, items, defaultOpen }: SidebarCollapseProps) => {
  return (

    <Collapsible.Root defaultOpen={defaultOpen}>
      <Collapsible.Trigger asChild>
        <HStack
          paddingRight={2}
          cursor="pointer"
          userSelect="none"
          justify="space-between"
          rounded="md"
          _hover={{ bg: "blackAlpha.50" }}
        >
          <SidebarItem to={to} label={label} main={true} />

          {/* rotate chevron when open */}
          <Collapsible.Indicator asChild>
            <Box transition="transform 150ms" _open={{ transform: "rotate(180deg)" }}>
              <FiChevronDown />
            </Box>
          </Collapsible.Indicator>
        </HStack>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <VStack align="stretch" gap={1} mt={2} mb={3}>
          {items.map((item) => (
            <SidebarItem key={item.to} to={item.to} label={item.label} />
          ))}
        </VStack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}