import OrganizationPageLayout from "@/components/Dashboard/OrganizationPageLayout";
import Button from "@/components/Forms/Button";

import { IconCalendar, IconCards, IconFolder } from "@tabler/icons";

export default function DashboardPage() {
    return (
        <OrganizationPageLayout className="flex flex-col gap-10">
            {/* Folders (Future Development) */}
            <div className="flex flex-wrap gap-5">
                <button className="flex items-center gap-4 truncate rounded-lg border border-dark-500 bg-dark-600 px-5 py-4">
                    <IconFolder height={20} width={undefined} />
                    <span>Folder Name</span>
                </button>
            </div>

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
        </OrganizationPageLayout>
    );
}
