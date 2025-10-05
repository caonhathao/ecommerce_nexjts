'use client';

import {useSignOut} from "@/hooks/use-signout";
import {Button} from "@/components/ui/button";

export default function Navbar() {
    const handleSignOut = useSignOut();

    return (
        <>
            Navbar

            <Button onClick={handleSignOut}>Sign Out</Button>
        </>
    )
}