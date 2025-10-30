import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface ImgData {
  alt: string;
  url: string;
}

const SlideImg = ({ data }: { data: ImgData[] }) => {
  return (
    <div className='w-full h-fit'>
      <Carousel>
        <CarouselContent>
          {data.map((value, index) => (
            <CarouselItem>
              <div key={index}>
                <img src={value.url} alt={value.alt} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};
export default SlideImg;
