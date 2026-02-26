interface StatCardProps {
  label: string;
  value: React.ReactNode;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="flex-1 bg-white p-5 rounded-lg shadow">
      <div className="text-gray-600 uppercase tracking-wide">{label}</div>
      <div className="text-4xl text-primary font-bold">{value}</div>
    </div>
  );
}
