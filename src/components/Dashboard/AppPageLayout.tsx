import Button from "@/components/Forms/Button";

import { IconBell, IconUsers, IconCards, IconPlus, IconSettings } from "@tabler/icons";

type AppShellProps = {
    children: React.ReactNode;
    className?: string;
    useSidebar?: boolean;
};

export default function AppPageLayout({ children, className, useSidebar = true }: AppShellProps) {
    return (
        <main className="relative flex h-screen max-h-screen min-h-screen flex-col items-center bg-dark-900 text-dark-50">
            <section className="flex w-full items-center justify-between border-b border-b-dark-600 bg-dark-800 px-20 py-5">
                <img src="https://britonenglish.co.id/images/logo-light.png" alt="Logo" className="h-6" />

                <div className="flex items-center gap-4">
                    <IconUsers height={20} />
                    <IconBell height={20} />
                </div>
            </section>

            <main className="flex h-full w-full items-start overflow-auto">
                {useSidebar && (
                    <section className="flex h-full w-72 shrink-0 flex-col gap-10 border-r border-r-dark-600 bg-dark-800 py-10">
                        <div className="flex flex-col gap-6 px-5">
                            <span className="text-xs font-medium opacity-50">Personal</span>

                            <button className="flex items-center gap-3">
                                <IconCards width={20} height={undefined} className="shrink-0" />
                                <p className="text-sm">All Projects</p>
                            </button>

                            <button className="flex items-center gap-3">
                                <IconSettings width={20} height={undefined} className="shrink-0" />
                                <p className="text-sm">Your Settings</p>
                            </button>
                        </div>

                        <hr className="border-dark-600" />

                        <div className="flex flex-col gap-6 px-5">
                            <span className="text-xs font-medium opacity-50">Organization</span>

                            <button className="flex items-center gap-3">
                                <img src="https://picsum.photos/200" alt="123" className="h-5 w-5 rounded-full" />

                                <p className="text-sm">Organization 1</p>
                            </button>

                            <Button.Small className="!py-1" icon={IconPlus}>
                                Create New Organization
                            </Button.Small>
                        </div>
                    </section>
                )}

                <section className={`max-h-full flex-1 overflow-auto ${className}`}>{children}</section>
            </main>
        </main>
    );
}
