import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <h1 className="font-serif text-8xl text-accent">404</h1>
      <p className="mt-4 text-xl text-text-secondary">Page not found</p>
      <Button asChild className="mt-8">
        <Link to="/collection">Back to Collection</Link>
      </Button>
    </div>
  );
}
