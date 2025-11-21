import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import logo from '@/public/logo-full.jpg';
import Autoplay from 'embla-carousel-autoplay';

export const CarouselPanel = () => {
  return (
    <div className="w-full flex justify-center items-center bg-[var(--background)] rounded-lg p-2">
      <Carousel
        opts={{
          align: 'center',
          loop: true, // 🔁 Cho phép quay vòng
          slidesToScroll: 2,
        }}
        plugins={[
          Autoplay({
            delay: 5000, // ⏱ thời gian giữa các lần chuyển (ms)
            stopOnInteraction: false, // ❌ không dừng khi người dùng bấm nút
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="w-full">
          {Array.from({ length: 6 }).map((_, index) => (
            <CarouselItem key={index} className="basis-full sm:basis-1/2">
              {/* basis-full → mỗi item chiếm toàn bộ chiều ngang trên mobile */}
              <div className="p-1 w-full h-full">
                <Card className="w-full h-[200px]">
                  <CardContent className="flex items-center justify-center p-0 w-full h-full">
                    <img
                      src={logo.src}
                      alt="logo"
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
