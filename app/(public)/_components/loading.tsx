import Image from 'next/image';

export const Loading = () => {
  return (
    <div className="w-screen h-screen fixed top-0 left-0 z-[100] flex justify-center items-center bg-gray-200 opacity-75">
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
