import { formatAdminDate } from "lib/admin-customers-model";
import {
  formatShipmentStatusLabel,
  shipmentStatusBadgeClass,
  type OrderShipmentSummary,
} from "lib/order-shipment";
import { cn } from "lib/utils";

export function OrderShipmentTableCell({ shipment }: { shipment: OrderShipmentSummary | null }) {
  if (!shipment) {
    return <span className="text-zinc-500">—</span>;
  }
  const hasTracking = Boolean(shipment.trackingCode);
  const hasStatus = Boolean(shipment.status);
  const hasCarrier = Boolean(shipment.carrier);
  if (!hasTracking && !hasStatus && !hasCarrier) {
    return <span className="text-zinc-500">—</span>;
  }
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {hasStatus ? (
        <span
          className={cn(
            "w-fit rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase",
            shipmentStatusBadgeClass(shipment.status!)
          )}
        >
          {formatShipmentStatusLabel(shipment.status!)}
        </span>
      ) : null}
      {hasCarrier || hasTracking ? (
        <p className="truncate text-xs text-zinc-700" title={[shipment.carrier, shipment.trackingCode].filter(Boolean).join(" · ")}>
          {hasCarrier ? <span className="font-medium text-zinc-900">{shipment.carrier}</span> : null}
          {hasCarrier && hasTracking ? <span className="px-1 text-zinc-400">·</span> : null}
          {hasTracking ? <span className="font-mono text-zinc-800">{shipment.trackingCode}</span> : null}
        </p>
      ) : (
        <p className="text-[11px] text-zinc-500">No tracking yet</p>
      )}
    </div>
  );
}

export function OrderShipmentDetailSection({
  shipment,
  heading = "Shipment",
}: {
  shipment: OrderShipmentSummary | null;
  heading?: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{heading}</p>
      {!shipment ? (
        <p className="mt-2 text-zinc-500">No shipment record yet.</p>
      ) : (
        <dl className="mt-2 space-y-2 rounded-xl border border-zinc-200 bg-zinc-50/50 px-3 py-3 text-zinc-800">
          {shipment.status ? (
            <div className="flex flex-wrap items-center gap-2">
              <dt className="text-xs font-medium text-zinc-500">Status</dt>
              <dd>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-semibold uppercase",
                    shipmentStatusBadgeClass(shipment.status)
                  )}
                >
                  {formatShipmentStatusLabel(shipment.status)}
                </span>
              </dd>
            </div>
          ) : null}
          {shipment.carrier ? (
            <div>
              <dt className="text-xs font-medium text-zinc-500">Carrier</dt>
              <dd className="mt-0.5 font-medium text-zinc-900">{shipment.carrier}</dd>
            </div>
          ) : null}
          {shipment.trackingCode ? (
            <div>
              <dt className="text-xs font-medium text-zinc-500">Tracking</dt>
              <dd className="mt-0.5 font-mono text-sm text-zinc-900">{shipment.trackingCode}</dd>
            </div>
          ) : null}
          {shipment.shippedAt ? (
            <div>
              <dt className="text-xs font-medium text-zinc-500">Shipped</dt>
              <dd className="mt-0.5">{formatAdminDate(shipment.shippedAt)}</dd>
            </div>
          ) : null}
          {shipment.deliveredAt ? (
            <div>
              <dt className="text-xs font-medium text-zinc-500">Delivered</dt>
              <dd className="mt-0.5">{formatAdminDate(shipment.deliveredAt)}</dd>
            </div>
          ) : null}
          {!shipment.status &&
          !shipment.carrier &&
          !shipment.trackingCode &&
          !shipment.shippedAt &&
          !shipment.deliveredAt ? (
            <p className="text-zinc-500">No tracking details yet.</p>
          ) : null}
        </dl>
      )}
    </div>
  );
}
