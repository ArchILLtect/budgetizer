import { Badge } from "@chakra-ui/react";


type Status = 'active' | 'expired' | 'applied' | 'partial-applied' | 'undone' | 'partial-undone' | '?';

export function StatusBadge({ status }: { status: Status }) {
  switch (status) {
    case 'active': return <Badge colorScheme='yellow'>Active</Badge>;
    case 'expired': return <Badge colorScheme='gray'>Expired</Badge>;
    case 'applied': return <Badge colorScheme='teal'>Applied</Badge>;
    case 'partial-applied': return <Badge colorScheme='purple'>Partial Applied</Badge>;
    case 'undone': return <Badge colorScheme='red'>Undone</Badge>;
    case 'partial-undone': return <Badge colorScheme='orange'>Partial Undone</Badge>;
    default: return <Badge>?</Badge>;
  }
}