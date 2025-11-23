import { useTranslations } from 'next-intl';

interface descProps {
  data: string;
}
const Desc = ({ data }: descProps) => {
  const t = useTranslations('product_detail.detail_desc');
  return (
    <div className="bg-background p-3 rounded-lg flex flex-col justify-start items-start gap-2`">
      <p className="text-xl font-bold py-2">{t('t_desc')}</p>
      <div>{data}</div>
    </div>
  );
};

export default Desc;
