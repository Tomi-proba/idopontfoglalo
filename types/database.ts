// Kézzel karbantartott típusok a supabase/migrations/0001_init.sql sémához.
// Ha a séma módosul, ezt a fájlt is frissíteni kell (vagy lecserélni a
// Supabase CLI generált típusaira: `supabase gen types typescript`).
//
// Fontos: minden sor-típus `type` alias (nem `interface`) — a
// @supabase/postgrest-js generikus insert/update típusfeloldása
// `interface`-ekkel `never`-re esik szét, ezért a hivatalos generált
// típusok is mindig `type`-ot használnak.

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";
export type AppointmentStatus = "scheduled" | "confirmed" | "cancelled" | "completed" | "no_show";
export type ReminderStatus = "pending" | "sent" | "failed";
export type WaitlistStatus = "waiting" | "offered" | "booked" | "expired";

export type Business = {
  id: string;
  owner_user_id: string;
  name: string;
  owner_email: string;
  timezone: string;
  reminder_template: string;
  reminder_hours_before: number;
  employee_count: number;
  price_per_seat: number;
  trial_started_at: string;
  trial_ends_at: string;
  subscription_status: SubscriptionStatus;
  trial_reminder_sent_at: string | null;
  created_at: string;
};

export type Employee = {
  id: string;
  business_id: string;
  name: string;
  active: boolean;
  created_at: string;
};

export type BusinessHours = {
  id: string;
  business_id: string;
  employee_id: string | null;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
  created_at: string;
};

export type Closure = {
  id: string;
  business_id: string;
  employee_id: string | null;
  starts_at: string;
  ends_at: string;
  reason: string | null;
  created_at: string;
};

export type Service = {
  id: string;
  business_id: string;
  name: string;
  duration_minutes: number;
  active: boolean;
  created_at: string;
};

export type Customer = {
  id: string;
  business_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
};

export type Appointment = {
  id: string;
  business_id: string;
  employee_id: string;
  customer_id: string;
  service_id: string | null;
  starts_at: string;
  status: AppointmentStatus;
  confirmation_token: string;
  confirmed_at: string | null;
  notes: string | null;
  created_at: string;
};

export type ReminderMessage = {
  id: string;
  appointment_id: string;
  business_id: string;
  rendered_message: string;
  scheduled_for: string;
  sent_at: string | null;
  status: ReminderStatus;
  created_at: string;
};

export type Waitlist = {
  id: string;
  business_id: string;
  employee_id: string | null;
  customer_id: string;
  service_id: string | null;
  status: WaitlistStatus;
  created_at: string;
};

export type ReviewRequest = {
  id: string;
  appointment_id: string;
  business_id: string;
  employee_id: string;
  sent_at: string | null;
  clicked_at: string | null;
  rating: number | null;
  comment: string | null;
  created_at: string;
};

type Table<Row, RequiredInsertKeys extends keyof Row> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, RequiredInsertKeys>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      businesses: Table<Business, "owner_user_id" | "name" | "owner_email">;
      employees: Table<Employee, "business_id" | "name">;
      business_hours: Table<BusinessHours, "business_id" | "day_of_week" | "open_time" | "close_time">;
      closures: Table<Closure, "business_id" | "starts_at" | "ends_at">;
      services: Table<Service, "business_id" | "name">;
      customers: Table<Customer, "business_id" | "name">;
      appointments: Table<Appointment, "business_id" | "employee_id" | "customer_id" | "starts_at">;
      reminder_messages: Table<
        ReminderMessage,
        "appointment_id" | "business_id" | "rendered_message" | "scheduled_for"
      >;
      waitlist: Table<Waitlist, "business_id" | "customer_id">;
      review_requests: Table<ReviewRequest, "appointment_id" | "business_id" | "employee_id">;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
