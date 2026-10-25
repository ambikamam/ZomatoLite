import { Suspense } from 'react';
import ReviewForm from './ReviewForm';

export default function ReviewPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#faf9f7] text-[#1a1a1a]"><div className="mx-auto max-w-[560px] px-4 py-10"><p>Loading...</p></div></main>}>
      <ReviewForm />
    </Suspense>
  );
}
