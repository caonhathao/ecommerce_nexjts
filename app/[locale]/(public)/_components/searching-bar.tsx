"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

type FormSchemaType = z.infer<typeof formSchema>;

const SearchingBar = () => {
  const t = useTranslations("layout");
  const form = useForm<FormSchemaType>();

  function onSubmit(values: FormSchemaType) {
    console.log(values);
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-row gap-4 w-full border border-gray-300 rounded-lg p-2"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="flex-1 ">
                {" "}
                <FormControl>
                  <Input
                    placeholder={t("search_placeholder")}
                    {...field}
                    className="w-full border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none shadow-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator orientation="vertical" />
          <Button
            variant={"ghost"}
            type="submit"
            className="text-[var(--primary)] hover:cursor-pointer"
          >
            {t("search_button")}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SearchingBar;
