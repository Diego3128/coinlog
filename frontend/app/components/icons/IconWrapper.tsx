import { ReactNode } from "react";

export default function IconWrapper({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <div className={`transition-all duration-500 hover:-translate-y-2.5 p-3 w-fit rounded-full shadow-md shadow-primary bg-white ${className}`}>{children}</div>
  );
}
