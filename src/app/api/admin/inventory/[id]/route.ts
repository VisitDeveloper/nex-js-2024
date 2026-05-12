import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  AdminAuthError,
  requirePortalStrapiSession,
  strapiAdminFetch,
} from "lib/admin-strapi";
import { canManageProducts } from "lib/portal-roles";

const patchSchema = z
  .object({
    add: z.number().int().positive().optional(),
    subtract: z.number().int().positive().optional(),
    outOfStock: z.literal(true).optional(),
    /** Set absolute on-hand (available is recomputed from reserved). */
    setOnHand: z.number().int().min(0).optional(),
  })
  .refine(
    (o) => {
      const c = [
        o.add != null,
        o.subtract != null,
        o.outOfStock === true,
        o.setOnHand != null,
      ].filter(Boolean).length;
      return c === 1;
    },
    { message: "Send exactly one of: add, subtract, outOfStock: true, or setOnHand" }
  );

async function readInventory(
  strapiJwt: string,
  id: string
): Promise<{ onHand: number; reserved: number; warehouseCode: string } | null> {
  const res = await strapiAdminFetch(`/api/inventories/${id}`, strapiJwt);
  if (!res.ok) return null;
  const json = await res.json().catch(() => ({}));
  const a = json?.data?.attributes;
  if (!a) return null;
  return {
    onHand: Math.max(0, Number(a.onHand) || 0),
    reserved: Math.max(0, Number(a.reserved) || 0),
    warehouseCode: typeof a.warehouseCode === "string" ? a.warehouseCode : "MAIN",
  };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { role, strapiJwt } = await requirePortalStrapiSession();
    if (!canManageProducts(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const json = await req.json();
    const body = patchSchema.parse(json);

    const current = await readInventory(strapiJwt, id);
    if (!current) {
      return NextResponse.json({ error: "Inventory not found" }, { status: 404 });
    }

    let onHand = current.onHand;
    if (body.outOfStock === true) {
      onHand = 0;
    } else if (body.setOnHand != null) {
      onHand = body.setOnHand;
    } else if (body.add != null) {
      onHand = current.onHand + body.add;
    } else if (body.subtract != null) {
      onHand = Math.max(0, current.onHand - body.subtract);
    }

    const available = Math.max(0, onHand - current.reserved);

    const res = await strapiAdminFetch(`/api/inventories/${id}`, strapiJwt, {
      method: "PUT",
      body: JSON.stringify({
        data: {
          onHand,
          reserved: current.reserved,
          available,
          warehouseCode: current.warehouseCode,
        },
      }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            payload?.error?.message ||
            payload?.message ||
            "Failed to update inventory",
          details: payload,
        },
        { status: res.status }
      );
    }
    return NextResponse.json(payload);
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", issues: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
