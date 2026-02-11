import { Button, HStack, Text, Icon, Spacer } from "@chakra-ui/react";
import { RouterLink } from "./RouterLink";
import { FiList, FiCalendar } from "react-icons/fi";

export const SidebarItem = (
  {
    to,
    label,
    main,
    rightAdornment,
  }: {
    to: string;
    label: string;
    main?: boolean;
    rightAdornment?: React.ReactNode;
  }
) => {
  return (
    <RouterLink to={to}>
      {({ isActive }) => (
        <Button
          as="span"
          variant="ghost"
          justifyContent="flex-start"
          width="100%"
          paddingX={main ? 2 : 5}
          fontWeight={main ? "700" : "500"}
          color={main ? "black" : ""}
          bg={isActive ? "blackAlpha.100" : "transparent"}
          _hover={{ bg: "blackAlpha.100" }}
        >
          <HStack w="100%" gap={2} minW={0} justify="start">
            { to.startsWith("/lists/") && <Icon as={FiList } /> }
            { (to === "/today" || to === "/week" || to === "/month") && !main && <Icon as={FiCalendar } /> }
            <Text truncate>{label}</Text>
            {rightAdornment ?
              <>
                <Spacer/>
                <HStack flexShrink={0} gap={1}>
                  {rightAdornment}
                </HStack>
              </> : null}
          </HStack>
        </Button>
      )}
    </RouterLink>
  );
}