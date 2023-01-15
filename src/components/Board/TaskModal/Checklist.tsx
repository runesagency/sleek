import type { Card as CardType } from "@/lib/types";

import Button from "@/components/Forms/Button";
import Checkbox from "@/components/Forms/Checkbox";

import { IconDots, IconPlus } from "@tabler/icons";
import { memo } from "react";

type ChecklistProps = {
    data?: CardType["checklists"][0]["checklist"];
};

const Checklist = ({ data }: ChecklistProps) => {
    if (!data) return null;

    const percentage = data.tasks.filter((task) => task.completed).length / data.tasks.length;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">{data.title}</h1>

                <div className="flex items-center gap-5">
                    <IconPlus />
                    <IconDots />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <section className="h-1.5 w-full rounded-full bg-dark-500">
                    <div className="h-full w-1/2 rounded-full bg-dark-50" />
                </section>

                <p className="text-xs">{percentage}%</p>
            </div>

            <div className="flex flex-col gap-3 pl-3">
                {data.tasks.map(({ text, completed }, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <Checkbox defaultChecked={completed} />

                        <div className="flex flex-col gap-2">{text}</div>
                    </div>
                ))}

                <Button.Small fit>Add New Task</Button.Small>
            </div>
        </div>
    );
};

export default memo(Checklist);
