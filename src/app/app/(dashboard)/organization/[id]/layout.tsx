"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

type DashboardLayoutProps = {
    children: React.ReactNode;
    params: {
        id: string;
    };
};

export default function DashboardLayout({ children, params: { id } }: DashboardLayoutProps) {
    const pathname = usePathname();
    const page = pathname?.split("/").pop();
    const pagePath = page === id ? "/" : `/${page}`;

    const links = [
        { name: "About", path: "/about" },
        { name: "Projects", path: "/" },
        { name: "Members", path: "/members" },
        { name: "Settings", path: "/settings" },
    ];

    return (
        <main className="flex flex-col">
            <img src="https://picsum.photos/1080" alt="banner" className="h-60 w-full object-cover object-center" />

            <nav className="flex flex-col border-b border-b-dark-600 bg-dark-800 px-12">
                <div className="flex items-center gap-5 py-5">
                    <img src="https://picsum.photos/200" alt="logo" className="h-12 w-12 rounded-full object-cover object-center" />
                    <h1 className="text-xl font-bold">PT Mencari Cinta Abadi</h1>
                </div>

                <div className="flex">
                    {links.map(({ name, path }, index) => (
                        <Link
                            key={index}
                            href={`/app/organization/${id}` + path}
                            className={clsx("ts-sm border-b-2 px-4 py-2 duration-200 hover:border-b-dark-500", pagePath === path ? "border-b-dark-400" : "border-b-transparent")}
                        >
                            {name}
                        </Link>
                    ))}
                </div>
            </nav>

            <div className="py-9 px-16 3xl:px-36">{children}</div>
        </main>
    );
}
