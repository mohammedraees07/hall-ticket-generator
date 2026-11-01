import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await dataStore.updateDepartment(Number(id), body);
    if (!updated) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update department error:", error);
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await dataStore.deleteDepartment(Number(id));
    if (!deleted) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete department error:", error);
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
  }
}
