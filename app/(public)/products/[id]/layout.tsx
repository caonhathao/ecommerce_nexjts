import { ReactNode } from "react";

export default function layoutDetail({ children }: { children: ReactNode }) {
  return <div className="w-full h-full m-0 p-0 flex flex-col justify-start items-center">{children}</div>;
};
