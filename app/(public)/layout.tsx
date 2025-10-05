import {ReactNode} from "react";
import Navbar from "@/app/(public)/_components/Navbar";

export default function Layout({children}: { children: ReactNode }) {
    return (
        <div>
            <Navbar/>
            <main>{children}</main>
        </div>
    );
}