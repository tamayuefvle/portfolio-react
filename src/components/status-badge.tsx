import { Badge } from "@/components/ui/badge";
import { labelFor, statuses, type StatusId } from "@/domain/model";

const variantFor: Record<StatusId, "default" | "secondary" | "outline" | "destructive"> = {
  available: "default",
  on_loan: "secondary",
  in_shipment: "outline",
  unavailable: "destructive",
};

export function StatusBadge({ status }: { status: StatusId }) {
  return <Badge variant={variantFor[status]}>{labelFor(statuses, status)}</Badge>;
}
