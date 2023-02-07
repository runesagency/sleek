import Button from "@/components/Forms/Button";

import { IconDoorEnter, IconLogin } from "@tabler/icons";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Navigation() {
    const { data: session } = useSession();

    return (
        <nav className="w-full bg-dark-800 text-dark-50">
            <main className="ts-base mx-auto flex max-w-screen-3xl justify-between px-48 py-8">
                <div className="flex items-center gap-12">
                    <img src="/logoipsum-286.svg" className="text-white" alt="logo_ipsum" width="174" height="32" />

                    <Link href="/pricing">Pricing</Link>

                    <Link href="/contact">Contact</Link>
                </div>

                <div className="flex items-center gap-5">
                    {session ? (
                        <Link href="/app">
                            <Button.Large icon={IconDoorEnter}>Go to Dashboard</Button.Large>
                        </Link>
                    ) : (
                        <Link href="/api/auth/signin">
                            <Button.Large icon={IconLogin}>Log In / Sign In</Button.Large>
                        </Link>
                    )}
                </div>
            </main>
        </nav>
    );
}
