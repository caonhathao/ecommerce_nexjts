"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const ModeToogle = () => {
  const t = useTranslations("layout");
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={"text-[var(--primary)]  hover:cursor-pointer"}
          size="icon"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className=" hover:cursor-pointer"
          onClick={() => setTheme("light")}
        >
          {t("light_mode")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className=" hover:cursor-pointer"
          onClick={() => setTheme("dark")}
        >
          {t("dark_mode")}
        </DropdownMenuItem>
        <DropdownMenuItem
          className=" hover:cursor-pointer"
          onClick={() => setTheme("system")}
        >
          {t("system_mode")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
