import { Separator } from '@/components/ui/separator';

const ShopProfile = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="grid grid-cols-5 p-2 gap-2 min-h-20 bg-background-secondary border border-secondary rounded-lg">
        {/* show main category */}
        <div className="flex felx-row justify-between items-start">
          <div className="flex flex-col justify-center items-start">
            <p className="font-semibold">Danh mục chính</p>
            <p className="italic">Không rõ</p>
          </div>
          <Separator orientation="vertical" className="bg-text" />
        </div>

        {/* show time joined */}
        <div className="flex felx-row justify-between items-start">
          <div className="flex flex-col justify-center items-start">
            <p className="font-semibold">Đã tham gia</p>
            <p className="italic">Không rõ</p>
          </div>
          <Separator orientation="vertical" className="bg-text" />
        </div>
        {/* show shipped on time */}
        <div className="flex felx-row justify-between items-start">
          <div className="flex flex-col justify-center items-start">
            <p className="font-semibold">Vận chuyển trong giờ</p>
            <p className="italic">Không rõ</p>
          </div>
          <Separator orientation="vertical" className="bg-text" />
        </div>
        {/* show canceled rate */}
        <div className="flex felx-row justify-between items-start">
          <div className="flex flex-col justify-center items-start">
            <p className="font-semibold">Tỉ lệ hủy hàng</p>
            <p className="italic">Không rõ</p>
          </div>
          <Separator orientation="vertical" className="bg-text" />
        </div>
        {/* show chat rate */}
        <div className="flex flex-col justify-center items-start">
          <p className="font-semibold">Trò chuyện</p>
          <p>Tỉ lệ phản hồi</p>
          <p className="italic">Không rõ</p>
          <p>Thời gian phản hồi</p>
          <p className="italic">Không rõ</p>
        </div>
      </div>
    </div>
  );
};

export default ShopProfile;
