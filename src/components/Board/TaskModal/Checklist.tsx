import type { PageProps } from "@/pages/projects/[id]";

import { Small } from "@/components/Forms/Button";
import Checkbox from "@/components/Forms/Checkbox";

import { IconDots, IconPlus } from "@tabler/icons";

type ChecklistProps = {
    data?: PageProps["cards"][0]["checklists"][0];
};

export default function Checklist({ data }: ChecklistProps) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">Preparation</h1>

                <div className="flex items-center gap-5">
                    <IconPlus />
                    <IconDots />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <section className="h-1.5 w-full rounded-full bg-dark-500">
                    <div className="h-full w-1/2 rounded-full bg-dark-50" />
                </section>

                <p className="text-xs">50%</p>
            </div>

            <div className="flex flex-col gap-3 pl-3">
                <div className="flex items-start gap-3">
                    <Checkbox />

                    <div className="flex flex-col gap-2">Create a Figma account</div>
                </div>
                <div className="flex items-start gap-3">
                    <Checkbox />

                    <div className="flex flex-col gap-2">Create a Figma account</div>
                </div>

                <Small fit>Add New Task</Small>
            </div>
        </div>
    );
}
