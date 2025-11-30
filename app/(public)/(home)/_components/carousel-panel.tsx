import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import logo from '@/public/logo-full.jpg';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

export const CarouselPanel = () => {
  return (
    <div className="w-full flex justify-center items-center bg-background-secondary rounded-lg p-2">
      <Carousel
        opts={{
          align: 'center',
          loop: true,
          slidesToScroll: 2,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: false,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="w-full">
          {Array.from({ length: 6 }).map((_, index) => (
            <CarouselItem key={index} className="basis-full sm:basis-1/2">
              <div className="p-1 w-full h-full">
                <Card className="w-full h-[200px]">
                  <CardContent className="flex items-center justify-center p-0 w-full h-full">
                    <Image
                      src={logo.src}
                      alt="logo"
                      width={0}
                      height={0}
                      className="w-full object-cover rounded-lg"
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
