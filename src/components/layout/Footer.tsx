import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-sm text-white/60 hover:text-white/80 transition-colors">
            © {new Date().getFullYear()} AfroWiki. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link 
              href="/terms" 
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Terms of Use
            </Link>
            <Link 
              href="/privacy" 
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/about" 
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
