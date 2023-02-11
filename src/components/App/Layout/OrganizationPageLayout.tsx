import type { ReactNode } from "react";

import AppPageLayout from "@/components/App/Layout/AppPageLayout";

import clsx from "clsx";

type OrganizationPageShellProps = {
    children: ReactNode;
    className?: string;
};

export default function OrganizationPageLayout({ children, className }: OrganizationPageShellProps) {
    return (
        <AppPageLayout className="flex flex-col">
            <img src="https://picsum.photos/1080" alt="banner" className="h-60 w-full object-cover object-center" />

            <nav className="flex flex-col border-b border-b-dark-600 bg-dark-800 px-12">
                <div className="flex items-center gap-5 py-5">
                    <img src="https://picsum.photos/200" alt="logo" className="h-12 w-12 rounded-full object-cover object-center" />
                    <h1 className="text-xl font-bold">PT Mencari Cinta Abadi</h1>
                </div>

                <div className="flex">
                    <a href="#" className="px-4 py-2 text-sm font-medium hover:border-b-dark-500">
                        About
                    </a>

                    <a href="#" className="border-b-2 border-b-dark-400 px-4 py-2 text-sm font-bold">
                        Projects
                    </a>

                    <a href="#" className="px-4 py-2 text-sm font-medium">
                        Members
                    </a>

                    <a href="#" className="px-4 py-2 text-sm font-medium">
                        Settings
                    </a>
                </div>
            </nav>

            <div className={clsx("py-9 px-16 3xl:px-36", className)}>{children}</div>
        </AppPageLayout>
    );
}
