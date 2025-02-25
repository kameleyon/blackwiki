import Link from 'next/link';

export default function ArticleNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold mb-6">Article Not Found</h1>
      <p className="text-white/70 mb-8 max-w-md mx-auto">
        The article you're looking for doesn't exist or may not be published yet.
      </p>
      <div className="flex justify-center gap-4">
        <Link 
          href="/"
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          Go Home
        </Link>
        <Link 
          href="/search"
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          Search Articles
        </Link>
      </div>
    </div>
  );
}
