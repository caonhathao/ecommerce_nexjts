export const VolumeBar = ({ size }: { size: number }) => {
  return (
    <div className="bg-background rounded-full w-full h-1">
      <div
        className="bg-primary rounded-full h-1 transition-all duration-300"
        style={{ width: `${size}%` }}
      ></div>
    </div>
  );
};
