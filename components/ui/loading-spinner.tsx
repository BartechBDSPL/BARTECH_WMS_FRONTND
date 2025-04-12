'use client';

import { cn } from '@/lib/utils';

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-background/60">
      <div className={cn('relative', className)}>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full bg-primary"
              style={{
                animation: `bounce 0.8s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Rotating ring
        <div className="absolute inset-0 -m-8">
          <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        </div> */}

        {/* Pulsing background */}
        {/* <div className="absolute inset-0 -m-12">
          <div className="w-24 h-24 rounded-full bg-primary/5 animate-pulse" />
        </div> */}

        {/* Loading text
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-primary/70 animate-pulse">
          Loading...
        </div> */}
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
