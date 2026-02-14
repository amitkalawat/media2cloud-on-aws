import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-accent text-white',
        secondary: 'border-transparent bg-accent-light text-accent',
        outline: 'border-border text-text',
        destructive: 'border-transparent bg-danger text-white',
        success: 'border-transparent bg-success text-white',
        warning: 'border-transparent bg-warning text-white',
        video: 'border-transparent bg-media-video text-white',
        photo: 'border-transparent bg-media-photo text-white',
        audio: 'border-transparent bg-media-audio text-white',
        document: 'border-transparent bg-media-document text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
