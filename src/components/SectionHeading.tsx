interface SectionHeadingProps {
  children: React.ReactNode;
}

export function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <h2 className="text-primary text-3xl font-bold mb-4 pb-3 border-b-2 border-primary">
      {children}
    </h2>
  );
}
