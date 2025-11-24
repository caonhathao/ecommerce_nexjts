'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { fetchProductById } from '@/funcs/fetch';
import logo from '@/public/logo.jpg';
import { productDetailType } from '@/types/public.data-types';
import { useParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { CiCreditCard1, CiShoppingCart } from 'react-icons/ci';
import {
  FaBoxOpen,
  FaCheckCircle,
  FaMinus,
  FaPlus,
  FaStar,
} from 'react-icons/fa';
import { GrPowerCycle } from 'react-icons/gr';
import { HiMiniCheckBadge } from 'react-icons/hi2';
import { MdAttachMoney, MdOutlineStore } from 'react-icons/md';
import { PiTruckLight } from 'react-icons/pi';
import { toast } from 'sonner';
import { formatPrice } from '../../_components/global-function';
import { Loading, LoadingComponent } from '../../_components/loading';
import { RatingStars } from '../../_components/rating-starts';
import SlideImg from './_components/slide-img';

import { createOrderDraft, getOrderDrafts } from '@/app/actions/order_draft';
import { authClient } from '@/lib/auth-client';
import { Prisma } from '@/lib/generated/prisma';
import { AddToCartRequest } from '@/types/cart.data-types';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { IoChatboxEllipsesOutline } from 'react-icons/io5';
import { TopDealItems } from '../../(home)/_components/top-deal-items';
import Desc from './_components/desc';
import { Reviews } from './_components/reviews';
import { SuggestDealToday } from './_components/suggest-deal-today';
import { ChatButton } from '@/components/chat/chat-button';
import Decimal = Prisma.Decimal;

interface selectedVariant {
  name: string;
  id: string;
  price: string;
  amount: number;
}
type itemType = {
  productId: string;
  variantId: string;
  quantity: number;
};

const DetailPage = () => {
  const route = useRouter();
  const params = useParams();
  const [data, setData] = useState<productDetailType | null>(null);
  const [selVariant, setSelVariant] = useState<selectedVariant | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const amount: number = 1;
  const t = useTranslations('product_detail');

  useEffect(() => {
    authClient.getSession().then((session) => {
      setIsLoggedIn(!!session.data);
    });
  }, []);

  const renderPriceSale = (
    typeVoucher: string | null,
    valueVoucher: string | null,
    price: string
  ) => {
    if (!typeVoucher || !valueVoucher) {
      return <p>{formatPrice(Number(price))}</p>;
    }

    const numericPrice = Number(price);
    const numericValue = Number(valueVoucher);

    if (typeVoucher === 'FIXED') {
      const finalPrice = Math.max(0, numericPrice - numericValue);
      return (
        <div className="flex flex-col justify-start items-start gap-2">
          <div className="flex flex-row justify-start items-center gap-2">
            {/* price-after-sale */}
            <p className="text-red-500 text-3xl font-bold">
              {formatPrice(finalPrice)}
            </p>
            {/* sale discount (show fixed amount) */}
            <p className="bg-secondary rounded-lg p-1 text-xs">
              {'-'} {formatPrice(numericValue)}
            </p>
            {/* origin price */}
            <p className="text-muted-foreground line-through">
              {formatPrice(numericPrice)}
            </p>
          </div>
          <p className="text-muted-foreground italic">{t('t_price_after')}</p>
        </div>
      );
    }
    if (typeVoucher === 'PERCENT') {
      return (
        <div className="flex flex-col justify-start items-start gap-2">
          <div className="flex flex-row justify-start items-center gap-2">
            {/* price-after-sale */}
            <p className="text-red-500 text-3xl font-bold">
              {formatPrice(
                Number(
                  Number(price) - (Number(price) * Number(valueVoucher)) / 100
                )
              )}
            </p>
            {/* sale discount */}
            <p className="bg-secondary rounded-lg p-1 text-xs">
              {'-'} {valueVoucher} {'%'}
            </p>
            {/* origin price */}
            <p className="text-muted-foreground line-through">
              {formatPrice(Number(price))}
            </p>
          </div>
          <p className="text-muted-foreground italic">{t('t_price_after')}</p>
        </div>
      );
    }
  };

  const handleSelectVariant = (
    id: string,
    name: string,
    price: string,
    amount: number = 1
  ) => {
    const payload: selectedVariant = {
      name: name,
      id: id,
      price: price,
      amount: amount,
    };
    setSelVariant(payload);
  };

  const handleMinus = () => {
    if (selVariant !== null && selVariant.amount > 1) {
      setSelVariant((prev) =>
        prev ? { ...prev, amount: prev.amount - 1 } : prev
      );
    }
  };
  const handlePlus = () => {
    if (selVariant !== null) {
      setSelVariant((prev) =>
        prev ? { ...prev, amount: prev.amount + 1 } : prev
      );
    }
  };

  const handleOpenShop = ({ slug }: { slug: string }) => {
    route.push(`/shop/${slug}`);
  };

  //get full product's detail
  useEffect(() => {
    if (typeof params?.id === 'string') {
      // 1. Define an async function inside the effect
      const loadData = async () => {
        // 2. Await the data (assuming fetchProductById returns a Promise or data)
        const res = await fetchProductById(params.id as string);

        if (res) {
          setData(res);
          // 3. Set the variant only AFTER you have the data
          setSelVariant({
            name: res.variants[0].name,
            id: res.variants[0].id,
            price: res.variants[0].price,
            amount: 1,
          });
        }
      };

      // 4. Call the async function
      loadData();
    }
  }, [params?.id]);

  const buyNow = async (params: itemType) => {
    const session = await authClient.getSession();
    if (session.data == null) {
      route.push('/auth/login');
    }

    try {
      const existing = await getOrderDrafts();
      if (existing.success && existing.draft) {
        toast.info(
          'Bạn có đơn hàng đang chờ xử lý. Chuyển đến trang thanh toán...',
          {
            duration: 4000,
            position: 'top-right',
          }
        );
        route.push('/checkout');
        return;
      }

      const data = {
        notes: '',
        items: [params],
        voucher: [
          {
            code: 'VC-6KSWBFG9',
          },
          {
            code: 'VC-KSXTMQ0T',
          },
        ],
      };
      const formData = new FormData();
      formData.append('data', JSON.stringify(data));

      const res = await createOrderDraft(formData);

      if (res.success) {
        toast.success('Đang chuyển đến trang thanh toán...');
        route.push('/checkout');
      } else if (!res.success && res.redirectTo) {
        toast.error(res.message, {
          position: 'top-right',
          duration: 3000,
        });
        route.push(res.redirectTo);
      } else {
        toast.error('Lỗi: ' + res.error);
        console.error(res.error);
      }
    } catch (e) {
      console.error('Lỗi khi tạo đơn hàng nháp:', e);
      toast.error(`Lỗi: ${e}`);
    }
  };

  const addProductToCart = async (params: AddToCartRequest) => {
    const session = await authClient.getSession();
    if (session.data == null) {
      route.push('/auth/login');
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        toast.success('Thêm vào giỏ hàng thành công', {
          duration: 3000,
          position: 'top-right',
          style: { color: 'var(--chart-2)' },
        });
      } else {
        let errorMessage = `Lỗi: ${response.status} ${response.statusText}`;
        try {
          const errorText = await response.json();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (e) {
          console.error(e);
        }

        console.log(errorMessage);
        let errNotice = '';
        if (response.status === 401) errNotice = 'Bạn chưa đăng nhập';

        toast.error(`Thêm vào giỏ hàng thất bại: ${errNotice}`, {
          duration: 3000,
          position: 'top-right',
          style: { color: 'var(--chart-1)' },
        });
      }
      // ------------------------------------
    } catch (error) {
      // This catch block will now *only* handle network failures
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      console.log(message);
      toast.error(`Thêm vào giỏ hàng thất bại: ${message}`, {
        duration: 3000,
        position: 'top-right',
        style: { color: 'var(--chart-1)' },
      });
    }
  };

  if (!data) return <Loading />;
  if (selVariant === null) {
    return <Loading />;
  }

  return (
    <div className="w-[75%] flex flex-col justify-center items-start gap-2 mt-5">
      <div className="w-full flex flex-row justify-center items-start gap-2">
        <section className="w-[70%] flex flex-col justify-start items-start gap-2">
          <div className="w-full flex flex-row gap-2">
            {/* product's image */}
            <div className="w-[40%] h-fit bg-background rounded-lg flex flex-col p-2 sticky top-3">
              {/* slider */}
              <div className="w-full p-2">
                <SlideImg data={data.images} />
              </div>
              <Separator />

              {/* desc */}
              <div className="flex flex-col justify-start items-start p-2">
                {/*<p className="text-xl font-bold mb-2">Đặc điểm nổi bậc</p>*/}
                <div className="flex flex-row justify-start items-center gap-1">
                  <FaCheckCircle color="var(--priamry)" size={15} />
                  Ôi holy cái này làm thế nào z?
                </div>
                <div className="flex flex-row justify-start items-center gap-1">
                  <FaCheckCircle color="var(--priamry)" size={15} />
                  Dù là 1 coder nhưng t thích là 1 wibu hơn
                </div>
                <div className="flex flex-row justify-start items-center gap-1">
                  <FaCheckCircle color="var(--priamry)" size={15} />
                  Vợ ta cũng sẽ là wifu tương lai của ta
                </div>
              </div>
            </div>
            {/* name and variants, shipping info, suggestions and description  */}
            <div className="w-[60%] flex flex-col gap-4">
              {/* name and variants*/}
              <div className="relative bg-background rounded-lg p-3 flex flex-col justify-start items-start">
                {/* badges */}
                <div className="absolute top-0 left-3 flex gap-2">
                  {[
                    'https://salt.tikicdn.com/ts/upload/be/67/48/04a82ab8df178e1a13bde38316081865.png',
                    'https://salt.tikicdn.com/ts/ta/b1/3f/4e/cc3d0a2dd751a7b06dd97d868d6afa56.png',
                    'https://salt.tikicdn.com/ts/upload/d7/56/04/b93b8c666e13f49971483596ef14800f.png',
                  ].map((src, i) => (
                    <div key={i} className="relative w-20 h-10">
                      <Image
                        src={src}
                        alt={`banner-${i}`}
                        fill
                        className="object-contain rounded-md"
                      />
                    </div>
                  ))}
                </div>

                {/* title */}
                <div className="text-xl font-medium mt-5">{data.title}</div>
                {/* ratingAvg, ratingCount, sold */}
                <div className="flex flex-row justify-start items-center gap-2 text-(--muted-background) text-sm mt-2">
                  {data.ratingAvg} <RatingStars value={data.ratingAvg} />
                  {'(' + data.ratingCount + ')'} |
                  <p className="text-secondary">
                    {t('t_sold')} {data.soldCount}
                  </p>
                </div>
                {/* price-after-sale, sale-value, origin-price */}
                <div className="flex flex-row gap-2">
                  {renderPriceSale(
                    // VoucherProduct is an array; use the first item's voucher (if present)
                    data.VoucherProduct?.[0]?.voucher?.type ?? null,
                    data.VoucherProduct?.[0]?.voucher?.value ?? null,
                    data.minPrice
                  )}
                </div>
                <div className="mt-2">
                  <p className="font-semibold">{t('t_variant_type')}</p>
                  <div className="flex flex-row flex-wrap justify-start items-start gap-2 mt-2">
                    {data.variants.map((value, index) => (
                      <div
                        key={index}
                        className="p-1 rounded-sm bg-border cursor-pointer border-2 hover:border-secondary hover:bg-transparent border-border transition duration-700"
                        onClick={() =>
                          handleSelectVariant(
                            value.id,
                            value.name,
                            value.price,
                            1
                          )
                        }
                      >
                        {value.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* shipping info */}
              <div className="bg-background p-3 rounded-lg flex flex-col justify-start items-start gap-1">
                <p className="font-semibold text-xl">{t('t_delivery_info')}</p>
                <p>Giao đến thị trấn Teyvalt</p>
                <Separator />
                <div className="flex flex-row justify-start items-center gap-1">
                  <PiTruckLight color="var(--chart-2)" size={15} />
                  Giao Thứ Sáu
                </div>
                <p>
                  Trước 19h, 31/10:{' '}
                  <strong className="text-chart-2">Miễn phí</strong>
                </p>
                <Separator />
                <div className="flex flex-row justify-start items-center gap-1">
                  <PiTruckLight color="var(--chart-2)" size={15} /> Freeship 10k
                  đơn 45k, Freeship 25k đơn từ 100k
                </div>
              </div>
              {/* vouchers (if has) */}
              {data.VoucherProduct.length !== 0 ? (
                <div className="flex flex-col p-2 gap-2 bg-background rounded-lg">
                  <p className="text-xl font-semibold">
                    {t('t_other_promotion')}
                  </p>
                  <div className="w-full flex justify-between items-center">
                    <p>
                      {data.VoucherProduct.length} {t('t_discount_code')}
                    </p>
                    <Button
                      variant="outline"
                      className="hover: cursor-pointer border border-border text-primary"
                    >
                      {t('t_more_action')}
                    </Button>
                  </div>
                </div>
              ) : null}

              {/* others services */}
              <div className="bg-background p-2 rounded-lg">
                <p className="font-semibold text-xl mb-2">
                  {t('t_more_services')}
                </p>
                <div className="flex flex-row justify-start items-center gap-2">
                  <CiCreditCard1 color="var(--primary)" size={25} />
                  {t('t_tiki_card')}
                </div>
                <Separator />
                <div className="flex flex-row justify-start items-center gap-2">
                  <CiShoppingCart color="var(--primary)" size={25} />
                  {t('t_pay_later')}
                </div>
              </div>

              {/* top deals */}
              <TopDealItems size="4" renderSaleValue={false} />
              {/* slo-gan */}
              <div className="bg-background p-3 rounded-lg">
                <p className="font-semibold text-xl">{t('t_slogan_1')}</p>
                <div className="flex flex-row justify-start items-center gap-2 py-1">
                  <FaBoxOpen color="var(--primary)" size={15} />
                  {t('t_slogan_2')}
                </div>
                <Separator />
                <div className="flex flex-row justify-start items-center gap-2 py-1">
                  <MdAttachMoney color="var(--primary)" size={15} />
                  {t('t_slogan_3')}
                </div>
                <Separator />
                <div className="flex flex-col justify-center items-start gap-2 py-1">
                  <div className="flex flex-row justify-start items-center gap-2">
                    <GrPowerCycle color="var(--primary)" size={15} />
                    {t('t_slogan_4')}
                  </div>
                  <Link href={'/'} className="underline text-sm text-primary">
                    {t('t_more_action')}
                  </Link>
                </div>
              </div>

              {/* description */}
              <Desc data={data.description} />
            </div>
          </div>
          {/* show shop info */}
          <div className="w-full bg-background p-3 rounded-lg mt-2 border border-border">
            {/* logo and name */}
            <div className="flex flex-row items-center justify-between gap-3">
              <div className="flex flex-row items-center gap-3">
                <Image
                  src={data.shop.logoUrl}
                  width={50}
                  height={50}
                  alt="shop-logo"
                  className="rounded-lg"
                />
                <div className="flex flex-col">
                  <p>{data.shop.name}</p>
                  <div className="flex flex-row items-center gap-0.5">
                    {data.shop.ratingAvg} <FaStar color="orange" size={15} />
                    <div>
                      {'('} {data.shop.ratingCount} đánh giá {')'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-row items-center gap-3">
                <Button variant={'outline'} className="hover:cursor-pointer">
                  <IoChatboxEllipsesOutline color="var(--primary)" />
                  Chat
                </Button>
                <Button
                  variant={'outline'}
                  onClick={() => handleOpenShop({ slug: data.shop.slug })}
                  className="hover:cursor-pointer"
                >
                  <MdOutlineStore color="var(--primary)" />
                  Ghé xem cửa hàng
                </Button>
              </div>
            </div>
          </div>
          <Suspense fallback={<LoadingComponent />}>
            <Reviews
              key={data.id}
              id={data.id}
              ratingAvg={data.ratingAvg}
              ratingCount={data.ratingCount}
            />
          </Suspense>
        </section>

        {/* payment methods */}
        <section className="w-[30%] sticky top-3">
          <div className="w-full bg-background rounded-lg p-2 flex flex-col gap-3">
            {/* title */}
            <div className="flex flex-row justify-start items-center gap-2 h-15 w-full">
              <Image src={logo} width={40} height={40} alt="logo" />
              <div className="flex flex-row justify-between items-center gap-2">
                <div className="flex flex-col justify-center items-start gap-2">
                  <p className="font-semibold text-sm whitespace-nowrap text-primary">
                    2T3H Trading
                  </p>
                  <Badge className="flex flex-row gap-2 justify-start items-center bg-blue-200 text-primary font-semibold">
                    <HiMiniCheckBadge color="var(--primary)" size={20} />
                    OFFICAL
                  </Badge>
                </div>
              </div>
              <div className="flex flex-row gap-2 justify-end items-center h-15 w-full">
                <p className="flex flex-row justify-center items-center gap-0.5">
                  {'4.7'}
                  <FaStar color="var(--chart-4)" size={15} />
                </p>
                <Separator orientation="vertical" />
                <p>{'5.5tr+ đánh giá'}</p>
              </div>
            </div>

            {isLoggedIn && (
              <ChatButton shopId={data.shop.id} product={{ id: data.id }} />
            )}

            <Separator />
            {/* payment info */}
            <div className="flex flex-col justify-start items-start gap-2">
              <div className="p-2 rounded-sm bg-secondary text-secondary-foreground text-center">
                {selVariant?.name}
              </div>
              <div className="w-full flex flex-row justify-between items-center gap-2">
                <p className="font-semibold">{t('t_quantity')}</p>
                <div className="flex flex-row gap-2 justify-start items-start">
                  <button
                    className={`w-10 h-10 border border-muted-foreground rounded-lg font-bold flex justify-center items-center ${
                      amount === 1
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer '
                    }`}
                    onClick={() => handleMinus()}
                  >
                    <FaMinus size={10} />
                  </button>
                  <button className="w-10 h-10 border border-muted-foreground rounded-lg flex justify-center items-center">
                    {selVariant?.amount}
                  </button>
                  <button
                    className="w-10 h-10 border border-muted-foreground rounded-lg font-bold flex justify-center items-center cursor-pointer"
                    onClick={() => handlePlus()}
                  >
                    <FaPlus size={10} />
                  </button>
                </div>
              </div>
              <div className="w-full flex flex-row justify-between items-center">
                <p className="font-semibold">{t('t_total')}</p>
                <p className="text-lg font-medium text-gray-700">
                  {formatPrice(
                    Number(selVariant.amount * Number(selVariant.price))
                  )}
                </p>
              </div>
            </div>
            {/* payment buttons */}
            <div className="flex flex-col justify-start items-start gap-2 w-full">
              <Button
                variant={'destructive'}
                className="w-full hover:cursor-pointer hover:bg-primary transition-colors duration-750"
                onClick={() => {
                  if (selVariant) {
                    const payload: itemType = {
                      variantId: selVariant.id,
                      productId: data.id,
                      quantity: selVariant.amount,
                    };
                    buyNow(payload);
                  }
                }}
              >
                {t('t_buy_action')}
              </Button>
              <Button
                variant={'outline'}
                className="border border-primary text-primary w-full cursor-pointer"
                onClick={() => {
                  if (selVariant) {
                    const payload: AddToCartRequest = {
                      variantId: selVariant.id,
                      quantity: selVariant.amount,
                      priceSnap: Decimal(selVariant.price),
                      currency: 'VND',
                    };
                    addProductToCart(payload);
                  }
                }}
              >
                {t('t_add_action')}
              </Button>
              <Button
                variant={'outline'}
                className="border border-primary text-primary w-full cursor-pointer"
              >
                {t('t_pay_later')}
              </Button>
            </div>
          </div>
        </section>
      </div>
      <div className="w-full">
        <SuggestDealToday />
      </div>
    </div>
  );
};
export default DetailPage;
