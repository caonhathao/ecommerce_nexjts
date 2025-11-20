'use client'
import { useState } from 'react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

interface ImgData {
  alt: string;
  url: string;
}

const SlideImg = ({ data }: { data: ImgData[] }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

  return (
    <div className="w-full flex flex-col gap-2">
      <Swiper
        spaceBetween={10}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="w-full rounded-lg"
      >
        {data.map((item, index) => (
          <SwiperSlide key={index}>
            <img
              src={item.url}
              alt={item.alt || `image-${index}`}
              className="w-full h-full object-cover rounded-lg"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={6}
        freeMode
        watchSlidesProgress
        modules={[FreeMode, Navigation, Thumbs]}
        className="w-full"
      >
        {data.map((item, index) => (
          <SwiperSlide key={index} className="cursor-pointer">
            <img
              src={item.url}
              alt={item.alt || `thumb-${index}`}
              className="w-full object-contain rounded-lg"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default SlideImg;
