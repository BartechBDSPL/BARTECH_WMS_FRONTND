"use client";

import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div 
      className={cn("container mx-auto px-4 py-8", className)} 
      {...props}
    >
      {children}
    </div>
  );
};
