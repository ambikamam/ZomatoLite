'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ReviewForm() {
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
    <div className="rounded-xl bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
      <h1 className="text-2xl font-extrabold text-[#1c1c1c]">Write a Review</h1>
      {restaurantName && <p className="mt-1 text-sm text-[#7e7e7e]">for {restaurantName}</p>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-[#7e7e7e]">Rating</label>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className={`text-4xl leading-none transition-colors ${
                  rating !== null && star <= rating ? 'text-[#fc8019]' : 'text-[#dcdcdc]'
                }`}
                aria-label={`${star} star`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-[#7e7e7e]" htmlFor="comment">
            Comment
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-3 w-full rounded-lg border border-[#e9e9e9] bg-[#f8f8f8] px-4 py-3 text-[15px] text-[#1c1c1c] focus:border-[#fc8019] focus:outline-none"
            rows={4}
            placeholder="Share your experience..."
          />
        </div>

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-[#fc8019] py-3.5 font-bold text-white transition-colors disabled:cursor-not-allowed disabled:bg-[#d8d8d8] disabled:text-[#8f8f8f]"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
