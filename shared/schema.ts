import {
  pgTable,
  text,
  varchar,
  timestamp,
  serial,
  integer,
  boolean,
  jsonb,
  date,
  numeric,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User types enum
export const UserRole = {
  TOURIST: "tourist",
  NOMAD: "nomad",
  BUSINESS: "business",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  password: varchar("password"), // Add password field for local auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 20 }).default(UserRole.TOURIST).notNull(),
  organizationId: varchar("organization_id"),
  preferences: jsonb("preferences"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  logo: varchar("logo", { length: 255 }),
  travelPolicyUrl: varchar("travel_policy_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trip types enum
export const TripType = {
  LEISURE: "leisure",
  WORK: "work",
  BUSINESS: "business",
  MIXED: "mixed",
} as const;

export type TripTypeType = (typeof TripType)[keyof typeof TripType];

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  organizationId: integer("organization_id").references(() => organizations.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  // Mantemos principais campos para compatibilidade com código existente
  destination: varchar("destination", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  // Campos adicionais para suporte multi-destino
  isMultiDestination: boolean("is_multi_destination").default(false),
  mainDestination: varchar("main_destination", { length: 100 }),
  tripType: varchar("trip_type", { length: 20 }).notNull(),
  budget: numeric("budget", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  notes: text("notes"),
  isPublic: boolean("is_public").default(false),
  sharedWithUserIds: varchar("shared_with_user_ids", { length: 255 }),
  itineraryTemplate: varchar("itinerary_template", { length: 50 }),
  paymentStatus: varchar("payment_status", { length: 20 }).default("pending"),
  // Campos para guardar detalhes de seleções de voo, hotel e resultados da simulação
  simulationResult: jsonb("simulation_result"),
  selectedFlightId: varchar("selected_flight_id", { length: 100 }),
  selectedHotelId: varchar("selected_hotel_id", { length: 100 }),
  status: varchar("status", { length: 20 }).default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => trips.id),
  name: varchar("name", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  orderIndex: integer("order_index").notNull().default(0), // Para sequenciar os destinos
  arrivalDate: date("arrival_date").notNull(),
  departureDate: date("departure_date").notNull(),
  accommodation: varchar("accommodation", { length: 100 }),
  transportTypeToNext: varchar("transport_type_to_next", { length: 50 }), // avião, trem, ônibus, carro
  transportCost: numeric("transport_cost", { precision: 10, scale: 2 }),
  transportCurrency: varchar("transport_currency", { length: 3 }).default("USD"),
  transportBookingRef: varchar("transport_booking_ref", { length: 100 }),
  transportTime: integer("transport_time"), // tempo em minutos até o próximo destino
  transportDistance: integer("transport_distance"), // distância em km até o próximo destino
  mustSeeAttractions: jsonb("must_see_attractions"),
  localNotes: text("local_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // coworking, cafe, hotel, etc.
  wifiSpeed: integer("wifi_speed"), // in Mbps
  price: numeric("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  amenities: jsonb("amenities"),
  rating: numeric("rating", { precision: 3, scale: 1 }),
  imageUrl: varchar("image_url", { length: 255 }),
  website: varchar("website", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tripWorkspaces = pgTable(
  "trip_workspaces",
  {
    tripId: integer("trip_id")
      .notNull()
      .references(() => trips.id),
    workspaceId: integer("workspace_id")
      .notNull()
      .references(() => workspaces.id),
    bookingStatus: varchar("booking_status", { length: 20 }).default("planned"),
    bookingReference: varchar("booking_reference", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey(table.tripId, table.workspaceId),
  })
);

export const attractions = pgTable("attractions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // museum, park, landmark, etc.
  price: numeric("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  rating: numeric("rating", { precision: 3, scale: 1 }),
  imageUrl: varchar("image_url", { length: 255 }),
  website: varchar("website", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tripAttractions = pgTable(
  "trip_attractions",
  {
    tripId: integer("trip_id")
      .notNull()
      .references(() => trips.id),
    attractionId: integer("attraction_id")
      .notNull()
      .references(() => attractions.id),
    visitDate: date("visit_date"),
    status: varchar("status", { length: 20 }).default("planned"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey(table.tripId, table.attractionId),
  })
);

export const accommodations = pgTable("accommodations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // hotel, hostel, apartment, etc.
  pricePerNight: numeric("price_per_night", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  amenities: jsonb("amenities"),
  rating: numeric("rating", { precision: 3, scale: 1 }),
  imageUrl: varchar("image_url", { length: 255 }),
  website: varchar("website", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tripAccommodations = pgTable(
  "trip_accommodations",
  {
    tripId: integer("trip_id")
      .notNull()
      .references(() => trips.id),
    accommodationId: integer("accommodation_id")
      .notNull()
      .references(() => accommodations.id),
    checkIn: date("check_in").notNull(),
    checkOut: date("check_out").notNull(),
    bookingStatus: varchar("booking_status", { length: 20 }).default("planned"),
    bookingReference: varchar("booking_reference", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey(table.tripId, table.accommodationId),
  })
);

export const visaInformation = pgTable("visa_information", {
  id: serial("id").primaryKey(),
  country: varchar("country", { length: 100 }).notNull(),
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  allowedStayDays: integer("allowed_stay_days"),
  visaType: varchar("visa_type", { length: 50 }).notNull(),
  requirements: jsonb("requirements"),
  cost: numeric("cost", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  processingTime: varchar("processing_time", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type", { length: 20 }).notNull(), // trip, workspace, attraction, etc.
  entityId: integer("entity_id").notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  text: text("text").notNull(),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 100 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 20 }).notNull(), // trip, system, social, etc.
  isRead: boolean("is_read").default(false),
  entityType: varchar("entity_type", { length: 20 }), // trip, workspace, user, etc.
  entityId: varchar("entity_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  trips: many(trips),
  comments: many(comments),
  notifications: many(notifications),
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
}));

export const tripsRelations = relations(trips, ({ many, one }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [trips.organizationId],
    references: [organizations.id],
  }),
  destinations: many(destinations),
  tripWorkspaces: many(tripWorkspaces),
  tripAttractions: many(tripAttractions),
  tripAccommodations: many(tripAccommodations),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertTripSchema = createInsertSchema(trips);
export const insertDestinationSchema = createInsertSchema(destinations);
export const insertWorkspaceSchema = createInsertSchema(workspaces);
export const insertAttractionSchema = createInsertSchema(attractions);
export const insertAccommodationSchema = createInsertSchema(accommodations);
export const insertCommentSchema = createInsertSchema(comments);
export const insertNotificationSchema = createInsertSchema(notifications);
export const insertVisaInformationSchema = createInsertSchema(visaInformation);
export const insertOrganizationSchema = createInsertSchema(organizations);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type Destination = typeof destinations.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type Attraction = typeof attractions.$inferSelect;
export type Accommodation = typeof accommodations.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type VisaInformation = typeof visaInformation.$inferSelect;
export type Organization = typeof organizations.$inferSelect;

// Extended schemas for more complex validations
export const tripValidationSchema = insertTripSchema.extend({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const workspaceValidationSchema = insertWorkspaceSchema.extend({
  amenities: z.array(z.string()).optional(),
});

export const visaInformationValidationSchema = insertVisaInformationSchema.extend({
  requirements: z.array(z.string()).optional(),
});
