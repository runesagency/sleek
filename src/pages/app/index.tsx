import AppShell from "@/components/Dashboard/AppShell";
import Button from "@/components/Forms/Button";

import { IconCalendar, IconCards } from "@tabler/icons";

export default function DashboardPage() {
    return (
        <AppShell className="flex flex-col">
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

            <div className="flex flex-col gap-10 px-36 py-9">
                {/* Folders (Future Development) */}

                {/* Project List */}
                <div className="grid grid-cols-3 gap-5">
                    <a className="flex items-start gap-4 rounded-lg border border-dark-500 bg-dark-600 p-4">
                        <img src="https://picsum.photos/1080" alt="banner" className="h-full w-1/3 shrink-0 rounded-lg object-cover object-center" />

                        <div className="flex flex-col gap-4 overflow-hidden">
                            <div className="flex items-center gap-2">
                                <img src="https://picsum.photos/1080" alt="banner" className="h-6 w-6 shrink-0 rounded-full object-cover object-center" />
                                <h3 className="text-base font-bold">Untitled Project</h3>
                            </div>

                            <p className="text-xs font-medium line-clamp-2">Oat cake danish pie croissant jujubes pastry. Dragée macaroon pastry toffee macaroon gummies gummi bears</p>

                            <div className="flex flex-wrap gap-1">
                                <Button.Small fit className="bg-dark-700 text-xs" icon={IconCards}>
                                    69 Boards
                                </Button.Small>

                                <Button.Small fit className="bg-dark-700 text-xs" icon={IconCalendar}>
                                    12 Jan 2023 - 35 Feb 3069
                                </Button.Small>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </AppShell>
    );
}
