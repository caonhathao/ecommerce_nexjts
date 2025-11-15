import Image from 'next/image';

interface EmptyStateProps {
  imageSrc?: string;
  title?: string;
}

export function EmptyState({
  imageSrc,
  title
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <div className="relative w-48 h-48 mb-6">
        <Image
          src={imageSrc!}
          alt="Empty state illustration"
          fill
          className="object-contain opacity-90"
        />
      </div>
      <h2 className="text-gray-700 font-medium text-lg">
        {title}
      </h2>
    </div>
  );
}
