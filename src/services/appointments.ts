import { prisma } from "@/lib/prisma";
import { AppointmentStatus, AppointmentType } from "@prisma/client";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addMinutes,
  format,
  parseISO,
  isBefore,
  isAfter,
  setHours,
  setMinutes,
} from "date-fns";
import type { TimeSlot } from "@/types";

export async function getAvailableSlots(date: Date): Promise<TimeSlot[]> {
  const dayOfWeek = date.getDay();

  const schedule = await prisma.scheduleConfig.findUnique({
    where: { dayOfWeek },
  });

  if (!schedule || !schedule.isActive) return [];

  const [startH, startM] = schedule.startTime.split(":").map(Number);
  const [endH, endM] = schedule.endTime.split(":").map(Number);

  const dayStart = setMinutes(setHours(date, startH), startM);
  const dayEnd = setMinutes(setHours(date, endH), endM);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      date: { gte: startOfDay(date), lte: endOfDay(date) },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });

  const blockedSlots = await prisma.blockedSlot.findMany({
    where: {
      date: { gte: startOfDay(date), lte: endOfDay(date) },
    },
  });

  const slots: TimeSlot[] = [];
  let current = dayStart;

  while (isBefore(current, dayEnd)) {
    const slotEnd = addMinutes(current, schedule.slotDuration);
    if (isAfter(slotEnd, dayEnd)) break;

    const isBooked = existingAppointments.some(
      (apt) =>
        isBefore(apt.startTime, slotEnd) && isAfter(apt.endTime, current)
    );

    const isBlocked = blockedSlots.some(
      (block) =>
        block.allDay ||
        (isBefore(block.startTime, slotEnd) &&
          isAfter(block.endTime, current))
    );

    slots.push({
      startTime: format(current, "HH:mm"),
      endTime: format(slotEnd, "HH:mm"),
      available: !isBooked && !isBlocked,
    });

    current = slotEnd;
  }

  return slots;
}

export async function createAppointment(data: {
  userId: string;
  type: AppointmentType;
  date: string;
  startTime: string;
  description: string;
  bodyArea: string;
  referenceImageUrl?: string;
}) {
  const dateObj = parseISO(data.date);
  const [startH, startM] = data.startTime.split(":").map(Number);

  const schedule = await prisma.scheduleConfig.findUnique({
    where: { dayOfWeek: dateObj.getDay() },
  });

  const duration = schedule?.slotDuration || 60;
  const start = setMinutes(setHours(dateObj, startH), startM);
  const end = addMinutes(start, duration);

  return prisma.appointment.create({
    data: {
      userId: data.userId,
      type: data.type,
      date: dateObj,
      startTime: start,
      endTime: end,
      description: data.description,
      bodyArea: data.bodyArea,
      referenceImageUrl: data.referenceImageUrl,
    },
    include: { user: true },
  });
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
) {
  return prisma.appointment.update({
    where: { id },
    data: { status },
    include: { user: true },
  });
}

export async function getAppointmentsByDateRange(
  start: Date,
  end: Date,
  status?: AppointmentStatus
) {
  return prisma.appointment.findMany({
    where: {
      date: { gte: start, lte: end },
      ...(status && { status }),
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, image: true },
      },
    },
    orderBy: { startTime: "asc" },
  });
}

export async function getWeekAppointments(date: Date) {
  return getAppointmentsByDateRange(
    startOfWeek(date, { weekStartsOn: 1 }),
    endOfWeek(date, { weekStartsOn: 1 })
  );
}

export async function getMonthAppointments(date: Date) {
  return getAppointmentsByDateRange(startOfMonth(date), endOfMonth(date));
}

export async function getClientHistory(userId: string) {
  return prisma.appointment.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
}

export async function blockSlot(data: {
  date: Date;
  startTime?: Date;
  endTime?: Date;
  reason?: string;
  allDay?: boolean;
}) {
  return prisma.blockedSlot.create({
    data: {
      date: data.date,
      startTime: data.startTime || data.date,
      endTime: data.endTime || data.date,
      reason: data.reason,
      allDay: data.allDay || false,
    },
  });
}

export async function removeBlockedSlot(id: string) {
  return prisma.blockedSlot.delete({ where: { id } });
}

export async function getAppointmentStats(month: Date) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);

  const [total, confirmed, completed, cancelled] = await Promise.all([
    prisma.appointment.count({ where: { date: { gte: start, lte: end } } }),
    prisma.appointment.count({
      where: { date: { gte: start, lte: end }, status: "CONFIRMED" },
    }),
    prisma.appointment.count({
      where: { date: { gte: start, lte: end }, status: "COMPLETED" },
    }),
    prisma.appointment.count({
      where: { date: { gte: start, lte: end }, status: "CANCELLED" },
    }),
  ]);

  return {
    total,
    confirmed,
    completed,
    cancelled,
    cancellationRate: total > 0 ? (cancelled / total) * 100 : 0,
  };
}
