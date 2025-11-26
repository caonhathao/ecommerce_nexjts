import Image from 'next/image';

export const Loading = () => {
  return (
    <div className="w-full h-full flex justify-center items-center bg-card opacity-75">
      <Image
        src="/loading.gif" // <-- The path is from the root
        alt="Loading..."
        width={100} // <-- Set the actual width of your GIF
        height={100} // <-- Set the actual height of your GIF
        unoptimized // <-- Recommended for GIFs to prevent animation issues
      />
    </div>
  );
};

export const LoadingComponent = () => {
  return (
    <div className="w-full h-full flex justify-center items-center bg--background opacity-75">
      <Image
        src="/loading.gif" // <-- The path is from the root
        alt="Loading..."
        width={100} // <-- Set the actual width of your GIF
        height={100} // <-- Set the actual height of your GIF
        unoptimized // <-- Recommended for GIFs to prevent animation issues
      />
    </div>
  );
};
