import Link from 'next/link';

export default function Home() {
  return (
    <>
      <header className="border-b border-[#ececec] bg-white px-5 py-4">
        <span className="text-xl font-extrabold italic text-[#fc8019]">zomato</span>
        <span className="text-xl font-extrabold text-[#3d4152]"> lite</span>
      </header>
      <main className="mx-auto max-w-[600px] px-5 py-10">
        <div className="rounded-xl bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
          <h1 className="text-2xl font-extrabold text-[#1c1c1c]">Zomato Lite</h1>
          <p className="mt-1 text-sm text-[#7e7e7e]">One restaurant. Write a review, read the reviews.</p>
          <Link
            href="/restaurant/1"
            className="mt-5 block rounded-lg bg-[#fc8019] py-3.5 text-center font-bold text-white active:bg-[#e67217]"
          >
            Open Ludhiana Burrito
          </Link>
        </div>
      </main>
    </>
  );
}
