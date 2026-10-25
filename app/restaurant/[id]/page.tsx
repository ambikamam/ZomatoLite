import Link from 'next/link';
import { neon } from '@neondatabase/serverless';
import { unstable_noStore as noStore } from 'next/cache';

const sql = neon(process.env.DATABASE_URL!);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-lg tracking-tight text-[#1e9e60]">
      {'★'.repeat(rating)}
      <span className="text-[#dcdcdc]">{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

function Header() {
  return (
    <header className="border-b border-[#ececec] bg-white px-5 py-4">
      <span className="text-xl font-extrabold italic text-[#fc8019]">zomato</span>
      <span className="text-xl font-extrabold text-[#3d4152]"> lite</span>
    </header>
  );
}

async function getRestaurant(id: string) {
  noStore();
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
      <>
        <Header />
        <main className="mx-auto max-w-[600px] px-5 py-10">
          <div className="rounded-xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
            <p className="font-semibold text-[#3d4152]">Restaurant not found.</p>
            <Link href="/" className="mt-3 inline-block text-sm font-bold text-[#fc8019]">
              Back home
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[600px] space-y-5 px-5 py-6">
        {/* Restaurant hero card */}
        <section className="rounded-xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
          <h1 className="text-2xl font-extrabold text-[#1c1c1c]">{data.name}</h1>
          <p className="mt-1 text-sm text-[#7e7e7e]">{data.cuisine}, {data.area}</p>

          <div className="my-4 border-t border-dashed border-[#e9e9e9]" />

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#1e9e60] px-2 py-1 text-sm font-bold text-white">
              ★ {data.averageRating === null ? '—' : data.averageRating}
            </span>
            <span className="text-sm text-[#7e7e7e]">
              {data.totalReviews === 0
                ? 'No reviews yet'
                : `${data.totalReviews} review${data.totalReviews === 1 ? '' : 's'}`}
            </span>
          </div>
        </section>

        {data.latestReview && (
          <section className="rounded-xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
            <h2 className="text-xs font-bold uppercase tracking-wide text-[#7e7e7e]">Latest review</h2>
            <div className="mt-3 rounded-lg bg-[#fff6ef] p-4">
              <Stars rating={data.latestReview.rating} />
              <p className="mt-2 text-[15px] font-medium text-[#1c1c1c]">{data.latestReview.comment}</p>
              <p className="mt-2 text-xs text-[#a5a5a5]">{formatDate(data.latestReview.createdAt)}</p>
            </div>
          </section>
        )}

        {data.reviews.length > 0 && (
          <section className="rounded-xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
            <h2 className="text-xs font-bold uppercase tracking-wide text-[#7e7e7e]">Other reviews</h2>
            <ul className="mt-3 space-y-4">
              {data.reviews.map((review: any) => (
                <li key={review.id} className="border-t border-[#f0f0f0] pt-4 first:border-t-0 first:pt-0">
                  <Stars rating={review.rating} />
                  <p className="mt-1 text-[15px] text-[#3d4152]">{review.comment}</p>
                  <p className="mt-1 text-xs text-[#a5a5a5]">{formatDate(review.createdAt)}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.totalReviews === 0 && (
          <div className="rounded-xl bg-white p-6 text-center shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
            <p className="text-sm text-[#7e7e7e]">No reviews yet. Be the first to share your experience.</p>
          </div>
        )}

        <Link
          href={`/review/${id}`}
          className="block rounded-lg bg-[#fc8019] py-3.5 text-center font-bold text-white active:bg-[#e67217]"
        >
          Write a Review
        </Link>
      </main>
    </>
  );
}
