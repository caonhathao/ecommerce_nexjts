import {ReactNode} from "react";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import UserNav from "@/app/(public)/(customer)/_components/user-nav";

export default async function UserLayout({children}: { children: ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) {
        return redirect("/login");
    }

    return (
        <div className="container mx-auto grid grid-cols-12 gap-6 py-6">
            <aside className="col-span-12 md:col-span-3"><UserNav user={{
              name : session.user.name ?? "",
              email : session.user.email ?? "",
              avatar_url : session.user.image ?? undefined
            }}/></aside>
            <main className="col-span-12 md:col-span-9">{children}</main>
        </div>
    )

}