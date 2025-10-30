interface descProps {
  data: string;
}
const Desc = ({ data }: descProps) => {
  return (
    <div className="bg-[var(--background)] p-3 rounded-lg flex flex-col justify-start items-start gap-2`">
      <p className="text-xl font-bold py-2">Mô tả sản phẩm</p>
      <div>{data}</div>
    </div>
  );
};

export default Desc;
