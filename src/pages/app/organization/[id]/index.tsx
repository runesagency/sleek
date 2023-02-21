import Project from "@/components/App/DataDisplay/Project";
import OrganizationPageLayout from "@/components/App/Layout/OrganizationPageLayout";
import Members from "@/pages/app/organization/[id]/members";
import Settings from "@/pages/app/organization/[id]/settings";

import { IconFolder } from "@tabler/icons";

export default function OrganizationProjectListPage() {
    return (
        <OrganizationPageLayout className="flex flex-col gap-10">
            {/* Folders (Future Development) */}
            {/* <div className="flex flex-wrap gap-5">
                <button className="flex items-center gap-4 truncate rounded-lg border border-dark-500 bg-dark-600 px-5 py-4">
                    <IconFolder height={20} width={undefined} />
                    <span>Folder Name</span>
                </button>
            </div> */}
            <Members />
            {/* <Settings/> */}
            {/* Project List */}
            {/* <div className="grid grid-cols-3 gap-5">
                <Project />
            </div> */}
        </OrganizationPageLayout>
    );
}
