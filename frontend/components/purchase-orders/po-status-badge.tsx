import { Badge } from "@/components/ui/badge";
import { PurchaseOrderStatus } from "@/types/purchase-order";

interface POStatusBadgeProps {
  status: PurchaseOrderStatus;
}

export function POStatusBadge({ status }: POStatusBadgeProps) {
  switch (status) {
    case PurchaseOrderStatus.Draft:
      return <Badge variant="secondary">Draft</Badge>;
    case PurchaseOrderStatus.Submitted:
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200">Submitted</Badge>;
    case PurchaseOrderStatus.Confirmed:
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200">Confirmed</Badge>;
    case PurchaseOrderStatus.PartiallyReceived:
      return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-200">Partially Received</Badge>;
    case PurchaseOrderStatus.Received:
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">Received</Badge>;
    case PurchaseOrderStatus.Cancelled:
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
