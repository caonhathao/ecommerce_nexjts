import { MultiUploader } from '@/components/file-uploader/multi-uploader';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { ManageProductFormInput } from './productSchema';

export default function ProductImagesStep() {
  const form = useFormContext<ManageProductFormInput>();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Product Images</h3>
      </div>

      <FormField
        control={form.control}
        name="images"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Upload Images <span className="text-destructive">*</span>
            </FormLabel>
            <FormControl>
              <MultiUploader
                onChange={(newFiles) => field.onChange(newFiles)}
                value={field.value}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
