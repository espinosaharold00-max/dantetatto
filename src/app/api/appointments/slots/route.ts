import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/services/appointments";
import { parseISO } from "date-fns";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { error: "Fecha requerida" },
      { status: 400 }
    );
  }

  try {
    const slots = await getAvailableSlots(parseISO(date));
    return NextResponse.json(slots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json(
      { error: "Error al obtener horarios" },
      { status: 500 }
    );
  }
}
