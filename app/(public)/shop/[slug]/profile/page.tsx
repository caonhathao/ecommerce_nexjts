import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';

const ShopProfile = () => {
  const t = useTranslations('shop_profile_page');
  return (
    <div className="flex justify-center items-center">
      <div className="grid grid-cols-5 p-2 gap-2 min-h-20 bg-background-secondary border border-secondary rounded-lg">
        {/* show main category */}
        <div className="flex felx-row justify-between items-start">
          <div className="flex flex-col justify-center items-start">
            <p className="font-semibold">{t('t_main_category')}</p>
            <p className="italic">{t('t_unknow')}</p>
          </div>
          <Separator orientation="vertical" className="bg-text" />
        </div>

        {/* show time joined */}
        <div className="flex felx-row justify-between items-start">
          <div className="flex flex-col justify-center items-start">
            <p className="font-semibold">{t('t_joined_time')}</p>
            <p className="italic">{t('t_unknow')}</p>
          </div>
          <Separator orientation="vertical" className="bg-text" />
        </div>
        {/* show shipped on time */}
        <div className="flex felx-row justify-between items-start">
          <div className="flex flex-col justify-center items-start">
            <p className="font-semibold">{t('t_delivery')}</p>
            <p className="italic">{t('t_unknow')}</p>
          </div>
          <Separator orientation="vertical" className="bg-text" />
        </div>
        {/* show canceled rate */}
        <div className="flex felx-row justify-between items-start">
          <div className="flex flex-col justify-center items-start">
            <p className="font-semibold">{t('t_cancel_rate')}</p>
            <p className="italic">{t('t_unknow')}</p>
          </div>
          <Separator orientation="vertical" className="bg-text" />
        </div>
        {/* show chat rate */}
        <div className="flex flex-col justify-center items-start">
          <p className="font-semibold">{t('t_chat')}</p>
          <p>{t('t_response_rate')}</p>
          <p className="italic">{t('t_unknow')}</p>
          <p>{t('t_time_response')}</p>
          <p className="italic">{t('t_unknow')}</p>
        </div>
      </div>
    </div>
  );
};

export default ShopProfile;
