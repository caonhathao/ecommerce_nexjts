import { NewArrivals } from '../../(home)/_components/new-arrivals';
import banner1 from '../../../../public/banners/296bdf2b-c90f-4001-a185-96a3a09e89b0_VN-1976-688.jpg_2200x2200q80.jpg_.png';
import banner2 from '../../../../public/banners/banner-home-1.png';
import Banner from '../../_components/banner';
const ShopPage = () => {
  return (
    <div className="h-screen my-3 flex flex-col gap-3">
      <Banner banner={banner1} />
      <NewArrivals size={'5'} />
      <Banner banner={banner2} />
    </div>
  );
};
export default ShopPage;
