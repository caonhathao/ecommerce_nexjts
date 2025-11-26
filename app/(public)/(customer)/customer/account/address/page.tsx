'use client';

import { MapPin, MapPinX, MapPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { AddressDTO } from '@/types/dtos/address.dto';
import { createAddress, getAddress } from '@/app/actions/address';
import { AddressCard } from '@/app/(public)/(customer)/customer/account/address/_components/table-address';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function AddressPage() {
  const t = useTranslations('customer.address');
  const [address, setAddress] = useState<AddressDTO[]>([]);
  const [isPendingTransition, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (_: any, formData: FormData) => {
      try {
        const addr = await createAddress(formData);
        toast.success(t('toast_create_success'));
        return { success: true, address: addr };
      } catch (err: any) {
        toast.error(t('toast_create_failed'));
        return { success: false, error: err.message };
      }
    },
    { success: false, error: '' }
  );

  useEffect(() => {
    startTransition(async () => {
      const data = await getAddress();
      if (data.success) setAddress(data.addresses);
    });
    setDialogOpen(false);
  }, []);

  const handleSubmit = (formData: FormData) => {
    const data = {
      phone: formData.get('phone'),
      line1: formData.get('line1'),
      ward: formData.get('ward'),
      district: formData.get('district'),
      city: formData.get('city'),
      country: formData.get('country'),
    };
    formData.append('data', JSON.stringify(data));
    return formAction(formData);
  };

  useEffect(() => {
    if (state.success) {
      startTransition(async () => {
        const data = await getAddress();
        if (data.success) setAddress(data.addresses);
      });
      setDialogOpen(false);
    }
  }, [state.success]);

  return (
    <div className="p-4 w-full min-h-fit">
      <div className="w-full flex justify-between items-center gap-6">
        <div className="flex items-center gap-3 px-5 py-2.5 bg-linear-to-r from-primary/90 to-chart-3/90 rounded-xl shadow-lg w-fit">
          <MapPin className="w-6 h-6 text-background" />
          <h2 className="text-xl md:text-2xl font-medium text-background">
            {t('title')}
          </h2>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" variant="outline">
              <MapPlus className="w-6 h-6" />
              <p>{t('add_new')}</p>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form action={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{t('modal_title')}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 mt-2">
                <div className="grid gap-3">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input id="phone" name="phone" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="line1">{t('line1')}</Label>
                  <Input id="line1" name="line1" required />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="ward">{t('ward')}</Label>
                  <Input id="ward" name="ward" required />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="district">{t('district')}</Label>
                  <Input id="district" name="district" required />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="city">{t('city')}</Label>
                  <Input id="city" name="city" required />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="country">{t('country')}</Label>
                  <Input
                    id="country"
                    name="country"
                    defaultValue={t('country_default')}
                    disabled
                  />
                </div>
              </div>
              <DialogFooter className="mt-2">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    {t('cancel')}
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending ? t('saving') : t('save')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {isPendingTransition ? (
        <p className="text-center mt-10">{t('loading')}</p>
      ) : address.length > 0 ? (
        <div className="mt-6 grid gap-4">
          {address.map((addr) => (
            <AddressCard key={addr.id} {...addr} />
          ))}
        </div>
      ) : (
        <div className="mt-12 flex gap-6 text-2xl justify-center text-center text-muted-foreground">
          <MapPinX className="w-6 h-6 mb-2" />
          {t('empty')}
        </div>
      )}
    </div>
  );
}
