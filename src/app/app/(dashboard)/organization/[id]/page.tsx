"use client";

import Project from "@/components/App/DataDisplay/Project";

import { IconFolder } from "@tabler/icons";

export default function OrganizationProjectListPage() {
    return (
        <main className="flex flex-col gap-10">
            {/* Folders (Future Development) */}
            <div className="flex flex-wrap gap-5">
                <button className="flex items-center gap-4 truncate rounded-lg border border-dark-500 bg-dark-600 px-5 py-4">
                    <IconFolder height={20} width={undefined} />
                    <span>Folder Name</span>
                </button>
            </div>

            {/* Project List */}
            <div className="grid grid-cols-3 gap-5">
                <Project />
            </div>
        </main>
    );
}