import Link from 'next/link';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

async function getRestaurant(id: string) {
  const restaurantId = parseInt(id);
  if (isNaN(restaurantId)) return null;

  const restaurants = await sql`SELECT name, cuisine, area FROM restaurants WHERE id = ${restaurantId}`;
  if (restaurants.length === 0) return null;

  const restaurant = restaurants[0];

  const stats = await sql`SELECT AVG(rating)::numeric(10,1) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE restaurant_id = ${restaurantId}`;
  const avgRating = stats[0].avg_rating;
  const totalReviews = parseInt(stats[0].total_reviews);

  if (totalReviews === 0) {
    return {
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      area: restaurant.area,
      averageRating: null,
      totalReviews: 0,
      latestReview: null,
      reviews: []
    };
  }

  const allReviews = await sql`SELECT id, rating, comment, created_at FROM reviews WHERE restaurant_id = ${restaurantId} ORDER BY created_at DESC, id DESC`;

  const latestReview = {
    id: allReviews[0].id,
    rating: allReviews[0].rating,
    comment: allReviews[0].comment,
    createdAt: allReviews[0].created_at
  };

  const olderReviews = allReviews.slice(1).map((r: any) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at
  }));

  return {
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    averageRating: avgRating === null ? null : parseFloat(avgRating),
    totalReviews: totalReviews,
    latestReview: latestReview,
    reviews: olderReviews
  };
}

export default async function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getRestaurant(id);

  if (!data) {
    return (
      <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a]">
        <div className="mx-auto max-w-[560px] px-4 py-10">
          <p>Restaurant not found.</p>
          <Link href="/" className="text-sm text-[#b8860b] hover:underline">Back home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a]">
      <div className="mx-auto max-w-[560px] px-4 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{data.name}</h1>
          <p className="text-sm text-[#666]">{data.cuisine}, {data.area}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold">
            {data.averageRating === null ? '—' : data.averageRating}
          </span>
          <span className="text-sm text-[#666]">
            {data.totalReviews === 0 ? 'No reviews yet' : `${data.totalReviews} review${data.totalReviews === 1 ? '' : 's'}`}
          </span>
        </div>

        {data.latestReview && (
          <section>
            <h2 className="text-sm font-medium mb-2">Latest review</h2>
            <div className="rounded border border-[#e5e2dc] bg-white p-4">
              <div className="text-[#b8860b] mb-1">{'★'.repeat(data.latestReview.rating)}{'☆'.repeat(5 - data.latestReview.rating)}</div>
              <p className="text-sm">{data.latestReview.comment}</p>
            </div>
          </section>
        )}

        {data.reviews && data.reviews.length > 0 && (
          <section>
            <h2 className="text-sm font-medium mb-2">Older reviews</h2>
            <ul className="space-y-3">
              {data.reviews.map((review: any) => (
                <li key={review.id} className="border-t border-[#e5e2dc] pt-3 first:border-t-0 first:pt-0">
                  <div className="text-[#b8860b] text-sm mb-1">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                  <p className="text-sm">{review.comment}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.totalReviews === 0 && (
          <div className="text-center py-6 text-sm text-[#666]">
            No reviews yet. Be the first to share your experience.
          </div>
        )}

        <div>
          <Link href={`/review/${id}`} className="text-sm text-[#b8860b] hover:underline">
            Write a review
          </Link>
        </div>
      </div>
    </main>
  );
}
