import { Box, Flex, Separator } from "@chakra-ui/react";
import { Tooltip } from "../components/ui/Tooltip";
import { SidebarItem } from "../components/SidebarItem";
import { sidebarItems, SIDEBAR_WIDTH, publicSidebarItems } from "../config/sidebar";
import { useSidebarWidthPreset } from "../store/localSettingsStore";

export function Sidebar() {

  const sidebarWidthPreset = useSidebarWidthPreset();
  const CURRENT_SIDEBAR_WIDTH = SIDEBAR_WIDTH[sidebarWidthPreset] ?? SIDEBAR_WIDTH.small;

  return (
    <Flex
      flexDirection={"column"}
      justifyContent={"space-between"}
      w={CURRENT_SIDEBAR_WIDTH}
      borderRightWidth="1px"
      bg={{ base: "teal.300", _dark: "teal.700" }}
      boxShadow="sm"
      position={"sticky"}
      minH="100%"
      zIndex="1000"
      shadow="md"
      borderY={"2px solid lightgray"}
      padding={3}
      >
      <Box>
        {sidebarItems.map((item) => (
          <Box key={item.to}>
            <SidebarItem key={item.to} to={item.to} label={item.label} />
            <Separator my={3} />
          </Box>
        ))}
      </Box>
      <Box>
        <Tooltip content="Resize Sidebar" placement="right">
          <Box>
        {import.meta.env.DEV ? (
          <>
            <Separator my={3} />
              <SidebarItem to="/dev" label="Dev" />
            <Separator my={3} />
          </>
        ) : null}
      </Box>
      </Tooltip>
      </Box>
      <Box mt={4}>
        {publicSidebarItems.map((item) => (
          <Box key={item.to}>
            <Separator my={3} />
            <SidebarItem key={item.to} to={item.to} label={item.label} />
          </Box>
        ))}
      </Box>
    </Flex>
  );
}