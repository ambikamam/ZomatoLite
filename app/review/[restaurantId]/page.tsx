import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import ReviewForm from './ReviewForm';

export default function ReviewPage() {
  noStore();
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a]"><div className="mx-auto max-w-[560px] px-4 py-10"><p>Loading...</p></div></main>}>
      <ReviewForm />
    </Suspense>
  );
}
