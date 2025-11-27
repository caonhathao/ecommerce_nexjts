import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';
import { FaAnglesLeft, FaAnglesRight } from 'react-icons/fa6';

const Pagination = ({
  current,
  total,
  setNext,
}: {
  current: number;
  total: number;
  setNext: Dispatch<SetStateAction<number>>;
}) => {
  const t = useTranslations('shop_product_page.pagination');
  return (
    <div className="flex flex-row justify-center items-center gap-3">
      {/* first page button */}
      <Button
        variant="outline"
        disabled={current === 1 ? true : false}
        onClick={() => setNext(1)}
        className="hover:cursor-pointer"
      >
        <FaAnglesLeft />
        {t('t_first_page')}
      </Button>
      {total <= 4 ? (
        Array.from({ length: total }).map((_, index) => (
          <Button
            variant={'outline'}
            key={index}
            onClick={() => setNext(index + 1)}
            className="hover:cursor-pointer"
          >
            {index + 1}
          </Button>
        ))
      ) : (
        <>
          {Array.from({ length: 2 }).map((_, index) => (
            <Button
              variant={'outline'}
              key={index}
              onClick={() => setNext(index + 1)}
              className="hover:cursor-pointer"
            >
              {index + 1}
            </Button>
          ))}
          <Button variant="outline">...</Button>
          {Array.from({ length: 2 }).map((_, index) => (
            <Button
              variant={'outline'}
              key={index}
              onClick={() => setNext(total - 1 + index)}
              className="hover:cursor-pointer"
            >
              {total - 1 + index}
            </Button>
          ))}
        </>
      )}

      {/* lastest page button */}
      <Button
        variant={'outline'}
        disabled={current === total ? true : false}
        onClick={() => setNext(total)}
        className="hover:cursor-pointer"
      >
        <FaAnglesRight />
        {t('t_lastest_page')}
      </Button>
    </div>
  );
};
export default Pagination;
