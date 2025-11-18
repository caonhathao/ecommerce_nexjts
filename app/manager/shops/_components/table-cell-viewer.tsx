'use client';
import { formatDay } from '@/app/(public)/_components/global-function';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    shopDetail,
    shopItemData,
    shopMember,
} from '@/types/manager.data-types';
import React, { SetStateAction, useEffect } from 'react';
import { MdOutlineCopyAll } from 'react-icons/md';
import { toast } from 'sonner';

export function TableCellViewer({
  item,
  setShopList,
  handleCopy,
}: {
  item: shopItemData;
  setShopList: React.Dispatch<SetStateAction<shopItemData[]>>;
  handleCopy: (id: string) => void;
}) {
  const isMobile = useIsMobile();
  const [detail, setDetail] = React.useState<shopDetail | null>(null);
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [defaultStatus, setDefaultStatus] = React.useState<string>('');

  const [value, setValue] = React.useState<string>('');

  // This effect runs when 'openIndex' changes
  useEffect(() => {
    // Only run if an item was OPENED
    if (openIndex !== null) {
      // We must wait for your 300ms animation to finish
      const timer = setTimeout(() => {
        const container = scrollContainerRef.current;

        // Find the specific <li> element we want to scroll to
        const element = document.getElementById(`variant-item-${openIndex}`);

        if (container && element) {
          // This calculates the <li>'s position *inside* the scroll container
          const scrollToPosition = element.offsetTop - container.offsetTop;

          // Scroll the container to the element
          container.scrollTo({
            top: scrollToPosition,
            behavior: 'smooth',
          });
        }
      }, 300); // 300ms matches your animation

      // Clean up the timer
      return () => clearTimeout(timer);
    }
  }, [openIndex]);
  async function fetchDetail() {
    try {
      const response = await fetch(`/api/manager/shop/query?id=${item.id}`);
      const detail = await response.json();
      console.log(detail.data);
      setDetail(detail.data);
    } catch (err) {
      console.error(err);
    }
  }

  const handleSubmit = async (value: string) => {
    try {
      const response = await fetch(`/api/manager/shop?id=${item.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: value }),
      });
      if (response.status === 200) {
        toast('Đã cập nhật sản phẩm', {
          description: 'Sản phẩm được cấp phép hiển thị',
        });
        setShopList((prev) => prev.filter((shop) => shop.id !== item.id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (detail) {
      console.log('fetched');
      setDefaultStatus(detail.status);
    }
  }, [detail]);

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left"
          onClick={fetchDetail}
        >
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{detail?.name || 'unknown'}</DrawerTitle>
          <DrawerDescription>Thông tin chi tiết cửa hàng</DrawerDescription>
        </DrawerHeader>
        <div
          className="flex flex-col gap-4 overflow-y-auto px-4 text-sm"
          ref={scrollContainerRef}
        >
          <form className="flex flex-col gap-4">
            <div className="w-full flex justify-center items-center mb-3">
              {/* show cover image */}
              <div className="w-full relative">
                <img
                  src={detail?.coverUrl}
                  alt="shop cover image"
                  className="w-full"
                />
                <div className="absolute left-5 -bottom-5">
                  <img
                    src={detail?.logoUrl}
                    alt="shop cover image"
                    className="w-10 rounded-full border border-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="shop">Cửa hàng</Label>
              <div className="w-full flex flex-row justify-between items-center gap-2">
                <div className="flex flex-row justify-start items-center gap-2">
                  <Avatar>
                    <AvatarImage src={detail?.logoUrl} alt="shopLogo" />
                    <AvatarFallback>UK</AvatarFallback>
                  </Avatar>
                  <p>{detail?.name}</p>
                </div>
                <Button
                  variant={'outline'}
                  type="button"
                  onClick={() => handleCopy(detail?.id ?? '')}
                >
                  Sao chép ID
                  <MdOutlineCopyAll />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="shop">Chủ sở hữu</Label>
              <div className="w-full flex flex-row justify-between items-center gap-2">
                <div className="flex flex-row justify-start items-center gap-2">
                  <Avatar>
                    <AvatarImage src={detail?.owner.image} alt="shopLogo" />
                    <AvatarFallback>UK</AvatarFallback>
                  </Avatar>
                  <p>{detail?.owner.name}</p>
                </div>
                <Button
                  variant={'outline'}
                  type="button"
                  onClick={() => handleCopy(detail?.id ?? '')}
                >
                  <MdOutlineCopyAll />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="title">Ngày tạo</Label>
                <div className="w-full">{formatDay(detail?.createdAt)}</div>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Ngày cập nhật</Label>
                <div className="flex flex-col gap-3">
                  <div className="w-full">{formatDay(detail?.updatedAt)}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="target">Điểm đánh giá</Label>
                <div>{detail?.ratingAvg}</div>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">Tổng đánh giá</Label>
                <div>{detail?.ratingCount}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="target">Email</Label>
                <div>{detail?.contactEmail}</div>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="limit">Điện thoại</Label>
                <div>{detail?.contactPhone}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="visibility">Trạng thái</Label>
              <Select
                value={defaultStatus}
                onValueChange={(value) => setValue(value)}
              >
                <SelectTrigger id="visibility" className="w-full">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                  <SelectItem value="PENDING">Đang chờ</SelectItem>
                  <SelectItem value="SUSPENDED">Bị cấm</SelectItem>
                  <SelectItem value="CLOSED">Đóng cửa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="type">Mô tả</Label>
              <textarea defaultValue={detail?.description || ''} />
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor="variants-list">Thành viên</Label>
              <div className="flex flex-col  gap-4">
                <ul className="w-full flex flex-col gap-2 ">
                  {detail?.members.map((value: shopMember, index) => (
                    <li
                      key={index}
                      id={`variant-item-${index}`}
                      className="flex flex-col gap-2"
                    >
                      <div className="w-full flex flex-row justify-between items-center">
                        <div className="flex flex-row justify-start items-center gap-2">
                          <p>
                            {index + 1}
                            {'. '}
                          </p>
                          <Avatar>
                            <AvatarImage
                              src={value.user.image}
                              alt="shopLogo"
                            />
                            <AvatarFallback>UK</AvatarFallback>
                          </Avatar>
                          <p>{value.user.name}</p>
                          <p>{'(' + value.role + ')'}</p>
                        </div>
                        <Button
                          variant={'outline'}
                          type="button"
                          onClick={() => handleCopy(value.id)}
                        >
                          <MdOutlineCopyAll />
                        </Button>
                      </div>
                      <Separator />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button onClick={() => handleSubmit(value)}>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
