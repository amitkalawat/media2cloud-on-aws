import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background px-4">
      <h1 className="font-serif text-[10rem] leading-none text-accent/20">404</h1>
      <h2 className="mt-2 font-serif text-3xl text-text">Page not found</h2>
      <p className="mt-3 text-text-secondary max-w-md text-center">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="mt-8">
        <Link to="/collection">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Collection
        </Link>
      </Button>
    </div>
  );
}
