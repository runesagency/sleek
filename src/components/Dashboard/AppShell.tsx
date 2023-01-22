import { IconBell, IconUsers } from "@tabler/icons";

type AppShellProps = {
    children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
    return (
        <main className="relative flex h-screen max-h-screen min-h-screen flex-col items-center bg-dark-900 text-dark-50">
            <section className="flex w-full items-center justify-between border-b border-b-dark-600 bg-dark-800 px-20 py-5">
                <img src="https://britonenglish.co.id/images/logo-light.png" alt="Logo" className="h-6" />

                <div className="flex items-center gap-4">
                    <IconUsers height={20} />
                    <IconBell height={20} />
                </div>
            </section>

            {children}
        </main>
    );
}
