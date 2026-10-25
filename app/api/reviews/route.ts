import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, rating, comment } = body;

    // 1. rating is an integer from 1 to 5
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5.' }, { status: 400 });
    }

    // 2. comment is a non-empty string after trimming whitespace
    if (typeof comment !== 'string' || comment.trim() === '') {
      return NextResponse.json({ error: 'Comment cannot be empty.' }, { status: 400 });
    }

    // 3. restaurantId refers to a restaurant that actually exists
    const restaurants = await sql`SELECT id FROM restaurants WHERE id = ${restaurantId}`;
    if (restaurants.length === 0) {
      return NextResponse.json({ error: 'Restaurant not found.' }, { status: 400 });
    }

    const result = await sql`INSERT INTO reviews (restaurant_id, rating, comment) VALUES (${restaurantId}, ${rating}, ${comment.trim()}) RETURNING id`;
    return NextResponse.json({ success: true, reviewId: result[0].id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
