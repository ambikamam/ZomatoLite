import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const restaurantId = parseInt(id);

    if (isNaN(restaurantId)) {
      return NextResponse.json({ error: 'Restaurant not found.' }, { status: 404 });
    }

    const restaurants = await sql`SELECT name, cuisine, area FROM restaurants WHERE id = ${restaurantId}`;
    if (restaurants.length === 0) {
      return NextResponse.json({ error: 'Restaurant not found.' }, { status: 404 });
    }

    const restaurant = restaurants[0];

    // Compute averages/counts from facts - no stored columns
    const stats = await sql`SELECT AVG(rating)::numeric(10,1) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE restaurant_id = ${restaurantId}`;
    const avgRating = stats[0].avg_rating;
    const totalReviews = parseInt(stats[0].total_reviews);

    if (totalReviews === 0) {
      return NextResponse.json({
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        area: restaurant.area,
        averageRating: null,
        totalReviews: 0,
        latestReview: null,
        reviews: []
      });
    }

    // Get all reviews newest first
    const allReviews = await sql`SELECT id, rating, comment, created_at FROM reviews WHERE restaurant_id = ${restaurantId} ORDER BY created_at DESC, id DESC`;

    const latestReview = {
      id: allReviews[0].id,
      rating: allReviews[0].rating,
      comment: allReviews[0].comment,
      createdAt: allReviews[0].created_at
    };

    // All reviews except the latest one, newest first
    const olderReviews = allReviews.slice(1).map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at
    }));

    return NextResponse.json({
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      area: restaurant.area,
      averageRating: parseFloat(avgRating),
      totalReviews: totalReviews,
      latestReview: latestReview,
      reviews: olderReviews
    });
  } catch (e) {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
