import Image from 'next/image';

const Banner = ({ banner }: { banner: any }) => {
  return (
    <div className="w-full">
      <Image
        src={banner}
        width={1200}
        height={400}
        alt="banner"
        className="rounded-lg"
      />
    </div>
  );
};
export default Banner;
