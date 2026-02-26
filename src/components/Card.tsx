interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-white p-5 rounded-lg shadow ${className}`.trim()}>
      {children}
    </div>
  );
}
