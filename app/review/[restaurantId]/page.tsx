import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import ReviewForm from './ReviewForm';

export default function ReviewPage() {
  noStore();
  return (
    <>
      <header className="border-b border-[#ececec] bg-white px-5 py-4">
        <span className="text-xl font-extrabold italic text-[#fc8019]">zomato</span>
        <span className="text-xl font-extrabold text-[#3d4152]"> lite</span>
      </header>
      <main className="mx-auto max-w-[600px] px-5 py-6">
        <Suspense
          fallback={
            <div className="rounded-xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
              <p className="text-sm text-[#7e7e7e]">Loading...</p>
            </div>
          }
        >
          <ReviewForm />
        </Suspense>
      </main>
    </>
  );
}
