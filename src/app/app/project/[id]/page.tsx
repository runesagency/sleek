"use client";

import MemberList from "@/components/DataDisplay/MemberList";
import { Button } from "@/components/Forms";

import { IconFilter, IconPlus, IconShare } from "@tabler/icons";
import Link from "next/link";

export default function ProjectBoardListPage() {
    return (
        <main className="flex flex-col gap-6">
            <div className="flex items-center gap-5">
                <MemberList.Large users={[]} />

                <Button.Large icon={IconPlus} fit>
                    Create New Board
                </Button.Large>

                <Button.Large icon={IconFilter} fit>
                    Filter
                </Button.Large>

                <Button.Large icon={IconShare} fit>
                    Share
                </Button.Large>
            </div>

            <div className="grid grid-cols-4 gap-5">
                <Link href="/app/board/RPfhg01t" className="flex flex-col overflow-hidden rounded-lg">
                    <div className="relative h-40 w-full">
                        <img src="https://picsum.photos/500" alt="bg" className="z-10 h-full w-full object-cover object-center" />
                        <div className="absolute inset-0 z-20 bg-gradient-to-b from-transparent to-dark-600" />
                    </div>

                    <div className="flex flex-col gap-1 bg-dark-600 p-3">
                        <h3 className="ts-base">Untitled Board</h3>
                        <p className="ts-xs">Oat cake danish pie croissant jujubes pastry. </p>
                    </div>
                </Link>
            </div>
        </main>
    );
}
