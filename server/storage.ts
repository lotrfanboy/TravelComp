import {
  users,
  type User,
  type UpsertUser,
  trips,
  type Trip,
  workspaces,
  type Workspace,
  accommodations,
  type Accommodation,
  attractions,
  type Attraction,
  notifications,
  type Notification,
  visaInformation,
  type VisaInformation,
  comments,
  type Comment,
  organizations,
  type Organization,
  destinations,
  tripWorkspaces,
  tripAccommodations,
  tripAttractions
} from "@shared/schema";
import { db } from "./db";
import { eq, and, like, gte, lte, desc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserCount(): Promise<number>;
  upsertUser(userData: UpsertUser): Promise<User>;
  createUser(userData: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  
  // Organization operations
  getOrganization(id: number): Promise<Organization | undefined>;
  createOrganization(organization: Omit<Organization, "id" | "createdAt" | "updatedAt">): Promise<Organization>;
  
  // Trip operations
  getTrip(id: number): Promise<Trip | undefined>;
  getTripsByUser(userId: string): Promise<Trip[]>;
  getTripsByOrganization(organizationId: number): Promise<Trip[]>;
  createTrip(trip: Omit<Trip, "id" | "createdAt" | "updatedAt">): Promise<Trip>;
  updateTrip(id: number, trip: Partial<Omit<Trip, "id" | "createdAt" | "updatedAt">>): Promise<Trip | undefined>;
  deleteTrip(id: number): Promise<boolean>;
  
  // Workspace operations
  getWorkspace(id: number): Promise<Workspace | undefined>;
  searchWorkspaces(city: string, country: string): Promise<Workspace[]>;
  createWorkspace(workspace: Omit<Workspace, "id" | "createdAt" | "updatedAt">): Promise<Workspace>;
  
  // Accommodation operations
  getAccommodation(id: number): Promise<Accommodation | undefined>;
  searchAccommodations(city: string, country: string, checkIn: Date, checkOut: Date): Promise<Accommodation[]>;
  createAccommodation(accommodation: Omit<Accommodation, "id" | "createdAt" | "updatedAt">): Promise<Accommodation>;
  
  // Attraction operations
  getAttraction(id: number): Promise<Attraction | undefined>;
  searchAttractions(city: string, country: string): Promise<Attraction[]>;
  createAttraction(attraction: Omit<Attraction, "id" | "createdAt" | "updatedAt">): Promise<Attraction>;
  
  // Notification operations
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: Omit<Notification, "id" | "createdAt">): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  
  // Visa information operations
  getVisaInformation(country: string): Promise<VisaInformation | undefined>;
  
  // Comment operations
  getCommentsByEntity(entityType: string, entityId: number): Promise<Comment[]>;
  createComment(comment: Omit<Comment, "id" | "createdAt" | "updatedAt">): Promise<Comment>;
  
  // Trip relations
  addDestinationToTrip(tripId: number, destination: Omit<any, "id" | "createdAt" | "updatedAt">): Promise<any>;
  addWorkspaceToTrip(tripId: number, workspaceId: number, data?: any): Promise<any>;
  addAccommodationToTrip(tripId: number, accommodationId: number, checkIn: Date, checkOut: Date, data?: any): Promise<any>;
  addAttractionToTrip(tripId: number, attractionId: number, data?: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getUserCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return result[0].count;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  // Organization operations
  async getOrganization(id: number): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, id));
    return organization;
  }
  
  async createOrganization(organization: Omit<Organization, "id" | "createdAt" | "updatedAt">): Promise<Organization> {
    const [newOrganization] = await db
      .insert(organizations)
      .values(organization)
      .returning();
    return newOrganization;
  }

  // Trip operations
  async getTrip(id: number): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip;
  }

  async getTripsByUser(userId: string): Promise<Trip[]> {
    // Selecionar explicitamente as colunas que sabemos que existem para evitar erros
    return db.select({
      id: trips.id,
      name: trips.name,
      userId: trips.userId,
      organizationId: trips.organizationId,
      startDate: trips.startDate,
      endDate: trips.endDate,
      destination: trips.destination,
      country: trips.country,
      is_multi_destination: trips.isMultiDestination,
      tripType: trips.tripType,
      budget: trips.budget,
      currency: trips.currency,
      notes: trips.notes,
      isPublic: trips.isPublic,
      createdAt: trips.createdAt,
      updatedAt: trips.updatedAt
    })
    .from(trips)
    .where(eq(trips.userId, userId))
    .orderBy(desc(trips.startDate));
  }

  async getTripsByOrganization(organizationId: number): Promise<Trip[]> {
    return db.select().from(trips).where(eq(trips.organizationId, organizationId)).orderBy(desc(trips.startDate));
  }

  async createTrip(trip: Omit<Trip, "id" | "createdAt" | "updatedAt">): Promise<Trip> {
    // Remover campos que podem não existir no banco de dados
    const { mainDestination, ...tripData } = trip as any;
    
    const [newTrip] = await db
      .insert(trips)
      .values(tripData)
      .returning();
    return newTrip;
  }

  async updateTrip(id: number, trip: Partial<Omit<Trip, "id" | "createdAt" | "updatedAt">>): Promise<Trip | undefined> {
    const [updatedTrip] = await db
      .update(trips)
      .set({ ...trip, updatedAt: new Date() })
      .where(eq(trips.id, id))
      .returning();
    return updatedTrip;
  }

  async deleteTrip(id: number): Promise<boolean> {
    await db.delete(trips).where(eq(trips.id, id));
    return true;
  }

  // Workspace operations
  async getWorkspace(id: number): Promise<Workspace | undefined> {
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    return workspace;
  }

  async searchWorkspaces(city: string, country: string): Promise<Workspace[]> {
    return db.select()
      .from(workspaces)
      .where(
        and(
          like(workspaces.city, `%${city}%`),
          like(workspaces.country, `%${country}%`)
        )
      )
      .orderBy(desc(workspaces.rating));
  }

  async createWorkspace(workspace: Omit<Workspace, "id" | "createdAt" | "updatedAt">): Promise<Workspace> {
    const [newWorkspace] = await db
      .insert(workspaces)
      .values(workspace)
      .returning();
    return newWorkspace;
  }

  // Accommodation operations
  async getAccommodation(id: number): Promise<Accommodation | undefined> {
    const [accommodation] = await db.select().from(accommodations).where(eq(accommodations.id, id));
    return accommodation;
  }

  async searchAccommodations(city: string, country: string, checkIn: Date, checkOut: Date): Promise<Accommodation[]> {
    return db.select()
      .from(accommodations)
      .where(
        and(
          like(accommodations.city, `%${city}%`),
          like(accommodations.country, `%${country}%`)
        )
      )
      .orderBy(desc(accommodations.rating));
  }

  async createAccommodation(accommodation: Omit<Accommodation, "id" | "createdAt" | "updatedAt">): Promise<Accommodation> {
    const [newAccommodation] = await db
      .insert(accommodations)
      .values(accommodation)
      .returning();
    return newAccommodation;
  }

  // Attraction operations
  async getAttraction(id: number): Promise<Attraction | undefined> {
    const [attraction] = await db.select().from(attractions).where(eq(attractions.id, id));
    return attraction;
  }

  async searchAttractions(city: string, country: string): Promise<Attraction[]> {
    return db.select()
      .from(attractions)
      .where(
        and(
          like(attractions.city, `%${city}%`),
          like(attractions.country, `%${country}%`)
        )
      )
      .orderBy(desc(attractions.rating));
  }

  async createAttraction(attraction: Omit<Attraction, "id" | "createdAt" | "updatedAt">): Promise<Attraction> {
    const [newAttraction] = await db
      .insert(attractions)
      .values(attraction)
      .returning();
    return newAttraction;
  }

  // Notification operations
  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: Omit<Notification, "id" | "createdAt">): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
    return true;
  }

  // Visa information operations
  async getVisaInformation(country: string): Promise<VisaInformation | undefined> {
    const [visa] = await db
      .select()
      .from(visaInformation)
      .where(like(visaInformation.country, `%${country}%`));
    return visa;
  }

  // Comment operations
  async getCommentsByEntity(entityType: string, entityId: number): Promise<Comment[]> {
    return db.select()
      .from(comments)
      .where(
        and(
          eq(comments.entityType, entityType),
          eq(comments.entityId, entityId)
        )
      )
      .orderBy(desc(comments.createdAt));
  }

  async createComment(comment: Omit<Comment, "id" | "createdAt" | "updatedAt">): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values(comment)
      .returning();
    return newComment;
  }

  // Trip relations
  async addDestinationToTrip(tripId: number, destinationData: { 
    name: string;
    country: string;
    arrivalDate: string | Date;
    departureDate: string | Date;
    accommodation?: string;
  }): Promise<any> {
    // Create destination using raw SQL query to avoid TypeScript issues
    const query = `
      INSERT INTO destinations 
        (trip_id, name, country, arrival_date, departure_date, accommodation)
      VALUES 
        ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const arrivalDate = typeof destinationData.arrivalDate === 'string' 
      ? new Date(destinationData.arrivalDate) 
      : destinationData.arrivalDate;
      
    const departureDate = typeof destinationData.departureDate === 'string' 
      ? new Date(destinationData.departureDate) 
      : destinationData.departureDate;
    
    const result = await db.execute(query, [
      tripId,
      destinationData.name,
      destinationData.country,
      arrivalDate,
      departureDate,
      destinationData.accommodation || null
    ]);
    
    return result.rows[0];
  }

  async addWorkspaceToTrip(tripId: number, workspaceId: number, data: any = {}): Promise<any> {
    const [relation] = await db
      .insert(tripWorkspaces)
      .values({ 
        tripId, 
        workspaceId,
        ...data
      })
      .onConflictDoUpdate({
        target: [tripWorkspaces.tripId, tripWorkspaces.workspaceId],
        set: {
          ...data,
          updatedAt: new Date(),
        },
      })
      .returning();
    return relation;
  }

  async addAccommodationToTrip(
    tripId: number, 
    accommodationId: number, 
    checkIn: Date, 
    checkOut: Date, 
    data: any = {}
  ): Promise<any> {
    const [relation] = await db
      .insert(tripAccommodations)
      .values({ 
        tripId, 
        accommodationId,
        checkIn,
        checkOut,
        ...data
      })
      .onConflictDoUpdate({
        target: [tripAccommodations.tripId, tripAccommodations.accommodationId],
        set: {
          checkIn,
          checkOut,
          ...data,
          updatedAt: new Date(),
        },
      })
      .returning();
    return relation;
  }

  async addAttractionToTrip(tripId: number, attractionId: number, data: any = {}): Promise<any> {
    const [relation] = await db
      .insert(tripAttractions)
      .values({ 
        tripId, 
        attractionId,
        ...data
      })
      .onConflictDoUpdate({
        target: [tripAttractions.tripId, tripAttractions.attractionId],
        set: {
          ...data,
          updatedAt: new Date(),
        },
      })
      .returning();
    return relation;
  }
}

export const storage = new DatabaseStorage();
