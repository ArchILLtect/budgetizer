import { Badge } from "@chakra-ui/react";


type Status = 'active' | 'expired' | 'applied' | 'partial-applied' | 'undone' | 'partial-undone' | '?';

export function StatusBadge({ status }: { status: Status }) {
  switch (status) {
    case 'active': return <Badge colorScheme='green' color={'yellow.700'} bg={'yellow.100'}>Active</Badge>;
    case 'expired': return <Badge colorScheme='red' color={'red.700'} bg={'red.100'}>Expired</Badge>;
    case 'applied': return <Badge colorScheme='green' color={'green.700'} bg={'green.100'}>Applied</Badge>;
    case 'partial-applied': return <Badge colorScheme='teal' color={'teal.700'} bg={'teal.100'}>Partial Applied</Badge>;
    case 'undone': return <Badge colorScheme='red' color={'red.700'} bg={'red.100'}>Undone</Badge>;
    case 'partial-undone': return <Badge colorScheme='orange' color={'orange.700'} bg={'orange.100'}>Partial Undone</Badge>;
    default: return <Badge>?</Badge>;
  }
}