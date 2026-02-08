import { Center, Spinner, type SpinnerProps } from "@chakra-ui/react";

export function BasicSpinner({
  height = "75vh",
  width = "100%",
  size = "xl",
}: {
  height?: string | number;
  width?: string | number;
  size?: SpinnerProps["size"];
}) {
  return (
    <Center width={width} height={height}>
      <Spinner size={size} />
    </Center>
  );
}