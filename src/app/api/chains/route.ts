import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const chainSchema = z.object({
  name: z.string().min(1).max(60),
  description: z.string().max(500).default(""),
  category: z.string().max(40).default("custom"),
  states: z.array(z.string().min(1).max(30)).min(2).max(10),
  matrix: z.array(z.array(z.number().min(0).max(1))).min(2).max(10),
});

export async function GET() {
  try {
    const chains = await db.chain.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(
      chains.map((c) => ({
        ...c,
        states: JSON.parse(c.states),
        matrix: JSON.parse(c.matrix),
      }))
    );
  } catch (e) {
    console.error("GET /api/chains error:", e);
    return NextResponse.json({ error: "Failed to list chains" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = chainSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid chain data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { name, description, category, states, matrix } = parsed.data;
    const chain = await db.chain.create({
      data: {
        name,
        description,
        category,
        states: JSON.stringify(states),
        matrix: JSON.stringify(matrix),
      },
    });
    return NextResponse.json(
      { ...chain, states: JSON.parse(chain.states), matrix: JSON.parse(chain.matrix) },
      { status: 201 }
    );
  } catch (e) {
    console.error("POST /api/chains error:", e);
    return NextResponse.json({ error: "Failed to create chain" }, { status: 500 });
  }
}
