import type {
  Appointment,
  AppointmentPayment,
  User,
  Product,
  Order,
  OrderItem,
  Review,
} from "@prisma/client";

export type AppointmentWithUser = Appointment & {
  user: Pick<User, "id" | "name" | "email" | "phone" | "image">;
};

export type AppointmentWithPayments = Appointment & {
  user: Pick<User, "id" | "name" | "email" | "phone" | "image">;
  payments: AppointmentPayment[];
};

export type PaymentSummary = {
  totalPrice: number;
  totalPaid: number;
  balance: number;
  paymentCount: number;
};

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
  user: Pick<User, "id" | "name" | "email">;
};

export type ReviewWithUser = Review & {
  user: Pick<User, "id" | "name" | "image">;
};

export type CartItem = {
  productId: string;
  quantity: number;
  product: Product;
};

export type TimeSlot = {
  startTime: string;
  endTime: string;
  available: boolean;
};

export type DaySchedule = {
  date: string;
  slots: TimeSlot[];
};
