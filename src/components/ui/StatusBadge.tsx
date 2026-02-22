import { Badge } from "@chakra-ui/react";


type Status = 'active' | 'expired' | 'applied' | 'partial-applied' | 'undone' | 'partial-undone' | '?';

export function StatusBadge({ status }: { status: Status }) {
  switch (status) {
    case 'active': return <Badge colorPalette='green'>Active</Badge>;
    case 'expired': return <Badge colorPalette='red'>Expired</Badge>;
    case 'applied': return <Badge colorPalette='green'>Applied</Badge>;
    case 'partial-applied': return <Badge colorPalette='teal'>Partial Applied</Badge>;
    case 'undone': return <Badge colorPalette='red'>Undone</Badge>;
    case 'partial-undone': return <Badge colorPalette='orange'>Partial Undone</Badge>;
    default: return <Badge>?</Badge>;
  }
}