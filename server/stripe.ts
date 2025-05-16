import Stripe from 'stripe';
import type { Request, Response } from 'express';
import { db } from './db';
import { storage } from './storage';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export interface BookingPaymentIntent {
  accommodationId?: number;
  attractionId?: number;
  workspaceId?: number;
  tripId: number;
  startDate: string;
  endDate: string;
  amount: number;
  currency: string;
  description: string;
}

export async function createPaymentIntent(req: Request, res: Response) {
  try {
    const {
      accommodationId,
      attractionId,
      workspaceId,
      tripId,
      startDate,
      endDate,
      amount,
      currency = 'usd',
      description,
    }: BookingPaymentIntent = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!tripId) {
      return res.status(400).json({ error: 'Trip ID is required' });
    }

    // Prepare metadata - ensure all values are strings or null
    const metadata: Record<string, string> = {
      tripId: tripId.toString(),
      startDate: startDate || '',
      endDate: endDate || '',
      description: description || ''
    };
    
    // Only add IDs that exist
    if (accommodationId) {
      metadata.accommodationId = accommodationId.toString();
    }
    
    if (attractionId) {
      metadata.attractionId = attractionId.toString();
    }
    
    if (workspaceId) {
      metadata.workspaceId = workspaceId.toString();
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
}

export async function handleBookingSuccess(req: Request, res: Response) {
  try {
    const { paymentIntentId } = req.params;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment has not been completed' });
    }

    const { 
      tripId, 
      accommodationId, 
      attractionId, 
      workspaceId,
      startDate,
      endDate,
      description 
    } = paymentIntent.metadata;

    // Add a booking confirmation record to the database based on the type of booking
    if (accommodationId) {
      // Add accommodation booking to trip
      const booking = await storage.addAccommodationToTrip(
        parseInt(tripId),
        parseInt(accommodationId),
        new Date(startDate),
        new Date(endDate),
        {
          paymentIntentId,
          confirmed: true,
          amount: paymentIntent.amount / 100, // Convert cents to dollars
          currency: paymentIntent.currency,
          description
        }
      );
      
      return res.json({ success: true, booking });
    }

    if (attractionId) {
      // Add attraction booking to trip
      const booking = await storage.addAttractionToTrip(
        parseInt(tripId),
        parseInt(attractionId),
        {
          paymentIntentId,
          confirmed: true,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          visitDate: startDate,
          description
        }
      );
      
      return res.json({ success: true, booking });
    }

    if (workspaceId) {
      // Add workspace booking to trip
      const booking = await storage.addWorkspaceToTrip(
        parseInt(tripId),
        parseInt(workspaceId),
        {
          paymentIntentId,
          confirmed: true,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          startDate,
          endDate,
          description
        }
      );
      
      return res.json({ success: true, booking });
    }

    res.status(400).json({ error: 'Invalid booking type' });
  } catch (error) {
    console.error('Error handling booking success:', error);
    res.status(500).json({ error: 'Failed to process booking confirmation' });
  }
}

export async function getBookingOptions(req: Request, res: Response) {
  try {
    const { type, id, startDate, endDate } = req.query;
    
    if (!type || !id) {
      return res.status(400).json({ error: 'Type and ID are required' });
    }

    let result;
    const entityId = parseInt(id as string);

    switch (type) {
      case 'accommodation':
        result = await storage.getAccommodation(entityId);
        break;
      case 'attraction':
        result = await storage.getAttraction(entityId);
        break;
      case 'workspace':
        result = await storage.getWorkspace(entityId);
        break;
      default:
        return res.status(400).json({ error: 'Invalid booking type' });
    }

    if (!result) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Calculate availability and pricing based on dates
    let availability = true;
    
    // Handle different pricing properties based on entity type
    let basePrice = 0;
    
    // We'll use type assertion and check for common price properties
    const item = result as any;
    
    if (type === 'accommodation') {
      basePrice = parseFloat(item.pricePerNight || '0') || 0;
    } else if (type === 'workspace') {
      basePrice = parseFloat(item.pricePerDay || '0') || 0;
    } else if (type === 'attraction') {
      basePrice = parseFloat(item.price || item.pricePerPerson || '0') || 0;
    }
    
    let totalPrice = basePrice;

    // For accommodations and workspaces, calculate total based on number of days
    if ((type === 'accommodation' || type === 'workspace') && startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      totalPrice = basePrice * days;
    }

    res.json({
      item: result,
      availability,
      pricing: {
        basePrice,
        totalPrice,
        currency: result.currency || 'USD'
      }
    });
  } catch (error) {
    console.error('Error getting booking options:', error);
    res.status(500).json({ error: 'Failed to get booking options' });
  }
}