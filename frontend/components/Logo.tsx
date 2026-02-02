import Link from 'next/link';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity ${className}`}>
      <img 
        src="/logo.svg" 
        alt="Open Data" 
        className="h-6 sm:h-8 w-auto"
        style={{ aspectRatio: 'auto' }}
      />
      <span className="text-xl sm:text-2xl font-serif font-normal">Open Data</span>
    </Link>
  );
}
