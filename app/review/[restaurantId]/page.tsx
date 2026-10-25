'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const [restaurantName, setRestaurantName] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.name) setRestaurantName(data.name);
      })
      .catch(() => {});
  }, [restaurantId]);

  const canSubmit = rating !== null && comment.trim() !== '' && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: parseInt(restaurantId),
          rating: rating,
          comment: comment
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setSubmitting(false);
        return;
      }

      router.push(`/restaurant/${restaurantId}`);
    } catch (err) {
      setError('Something went wrong.');
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a]">
      <div className="mx-auto max-w-[560px] px-4 py-10">
        <h1 className="text-2xl font-semibold mb-1">Write a review</h1>
        {restaurantName && <p className="text-sm text-[#666] mb-8">{restaurantName}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3,  4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${rating !== null && star <= rating ? 'text-[#b8860b]' : 'text-[#ccc]'}`}
                  aria-label={`${star} star`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2" htmlFor="comment">Comment</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded border border-[#ddd] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#b8860b]"
              rows={4}
              placeholder="Share your experience..."
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded bg-[#b8860b] px-4 py-2 text-sm text-white disabled:opacity-40 disabled:cursor-notable"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </main>
  );
}
