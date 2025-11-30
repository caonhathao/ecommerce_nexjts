'use client';

import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { UserProfileResponseDTO } from '@/types/dtos/user.dto';
import { useMemo } from 'react';
import {
  buildBirthDateString,
  mapDtoToFormValues,
  splitBirthDate,
} from '@/helpers/user-profile-helper';
import { updateProfileAction } from '@/app/actions/user-profile-action';
import { Button } from '@/components/ui/button';
import {
  makeUserProfileSchema,
  UserProfileFormValues,
} from '@/app/(public)/(customer)/customer/account/_components/makeUserSchema';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Separator } from '@/components/ui/separator';
import { useRouter, useSearchParams } from 'next/navigation';
type Props = {
  defaultValues: UserProfileResponseDTO;
};

export default function EditUserProfileForm({ defaultValues }: Props) {
  const t = useTranslations('customer.profile_page');

  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl');

  const schema = useMemo(
    () =>
      makeUserProfileSchema({
        fullNameRequired: t('errors.fullNameRequired'),
        emailInvalid: t('errors.emailInvalid'),
        phoneInvalid: t('errors.phoneInvalid'),
      }),
    [t]
  );
  splitBirthDate(defaultValues.birthDate);
  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: mapDtoToFormValues(defaultValues),
    mode: 'onChange',
  });

  const onSubmit = async (values: UserProfileFormValues) => {
    const birth = buildBirthDateString(
      values.birthDate?.day || '',
      values.birthDate?.month || '',
      values.birthDate?.year || ''
    );

    const formData = new FormData();
    const set = (k: string, v?: string | null) => {
      if (v !== undefined && v !== null && v !== '') formData.set(k, v);
    };

    set('name', values.fullName);
    set('emailForBill', values.emailForBill);
    set('phone', values.phone);
    set('gender', values.gender);
    set('birthDate', birth);

    try {
      await updateProfileAction(formData);
      toast.success(
        t('toasts.saved', { defaultValue: 'Profile updated successfully!' })
      );
      if (callbackUrl) {
        router.push(decodeURIComponent(callbackUrl));
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error(
        t('toasts.failed', { defaultValue: 'Failed to update profile.' })
      );
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-[59%_1%_40%] gap-6"
      >
        {/* Left */}
        <div className=" space-y-6">
          <h2 className="text-lg font-semibold">{t('title')}</h2>

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fullName')}</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('placeholders.fullName')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Birthday */}
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('birthday')}</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <select
                      value={field.value?.day ?? ''}
                      onChange={(e) =>
                        field.onChange({ ...field.value, day: e.target.value })
                      }
                      className="border rounded p-2 w-24"
                    >
                      <option value="">{t('day')}</option>
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1)}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <select
                      value={field.value?.month ?? ''}
                      onChange={(e) =>
                        field.onChange({
                          ...field.value,
                          month: e.target.value,
                        })
                      }
                      className="border rounded p-2 w-24"
                    >
                      <option value="">{t('month')}</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1)}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <select
                      value={field.value?.year ?? ''}
                      onChange={(e) =>
                        field.onChange({ ...field.value, year: e.target.value })
                      }
                      className="border rounded p-2 w-28"
                    >
                      <option value="">{t('year')}</option>
                      {Array.from({ length: 100 }, (_, i) => {
                        const y = new Date().getFullYear() - i;
                        return (
                          <option key={y} value={String(y)}>
                            {y}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('gender')}</FormLabel>
                <FormControl>
                  <div className="flex gap-6">
                    {(['male', 'female', 'other'] as const).map((val) => (
                      <label
                        key={val}
                        className="inline-flex items-center gap-2"
                      >
                        <input
                          type="radio"
                          value={val}
                          checked={field.value === val}
                          onChange={() => field.onChange(val)}
                        />
                        {t(val)}
                      </label>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator orientation="vertical" />

        {/* Right */}
        <div className="space-y-6">
          <div className="border-t border-gray-300 pt-4">
            <h3 className="text-base font-semibold">
              {t('phoneEmailSectionTitle')}
            </h3>
          </div>
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => {
              const { ref, ...inputProps } = field;
              return (
                <FormItem>
                  <FormLabel>{t('phone')}</FormLabel>
                  <FormControl>
                    <Input
                      {...inputProps}
                      ref={ref}
                      value={inputProps.value ?? ''}
                      placeholder={t('placeholders.phone')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="emailForBill"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('emailForBill')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={t('placeholders.emailForBill')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="mt-4">
            {t('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
