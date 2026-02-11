import { Switch } from "@chakra-ui/react"

type AppSwitchProps = {
  show: boolean;
  setShow: (show: boolean) => void;
}

export const AppSwitch = ({ show, setShow }: AppSwitchProps) => {

  return (
    <Switch.Root
      size="md" 
      checked={show} 
      onCheckedChange={(details: { checked: boolean }) => setShow(details.checked)}
    >
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>Checked: {show.toString()}</Switch.Label>
    </Switch.Root>
  );
};