import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-50 px-6">
      <div className="max-w-md text-center">
        <div className="font-serif text-6xl text-ink-900">404</div>
        <p className="mt-4 text-ink-600">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/en"
          className="mt-6 inline-block text-brand-700 hover:underline"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
