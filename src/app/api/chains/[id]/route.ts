import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  description: z.string().max(500).optional(),
  category: z.string().max(40).optional(),
  states: z.array(z.string().min(1).max(30)).min(2).max(10).optional(),
  matrix: z.array(z.array(z.number().min(0).max(1))).min(2).max(10).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chain = await db.chain.findUnique({ where: { id } });
    if (!chain) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      ...chain,
      states: JSON.parse(chain.states),
      matrix: JSON.parse(chain.matrix),
    });
  } catch (e) {
    console.error("GET /api/chains/[id] error:", e);
    return NextResponse.json({ error: "Failed to get chain" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    const data: Record<string, string> = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.category !== undefined) data.category = parsed.data.category;
    if (parsed.data.states !== undefined) data.states = JSON.stringify(parsed.data.states);
    if (parsed.data.matrix !== undefined) data.matrix = JSON.stringify(parsed.data.matrix);
    const chain = await db.chain.update({ where: { id }, data });
    return NextResponse.json({
      ...chain,
      states: JSON.parse(chain.states),
      matrix: JSON.parse(chain.matrix),
    });
  } catch (e) {
    console.error("PUT /api/chains/[id] error:", e);
    return NextResponse.json({ error: "Failed to update chain" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.chain.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/chains/[id] error:", e);
    return NextResponse.json({ error: "Failed to delete chain" }, { status: 500 });
  }
}
