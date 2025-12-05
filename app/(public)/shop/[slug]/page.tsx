import { NewArrivals } from '../../(home)/_components/new-arrivals';
import banner2 from '../../../../public/banners/banner-home-1.png';
import Banner from '../../_components/banner';
const ShopPage = () => {
  return (
    <div className="min-h-screen my-3 flex flex-col gap-3">
      <Banner banner={banner2} />
      <NewArrivals size={'5'} />
    </div>
  );
};
export default ShopPage;
