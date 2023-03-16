"use client";

import type { CardChecklist, CardChecklistTask } from "@prisma/client";

import { Button, Checkbox } from "@/components/Forms";

import { IconDots, IconPlus } from "@tabler/icons";
import { memo, useMemo } from "react";

type ChecklistProps = {
    data?: CardChecklist & {
        tasks: CardChecklistTask[];
    };
};

const Checklist = ({ data }: ChecklistProps) => {
    const percentage = useMemo(() => {
        if (!data) return 0;

        Math.round((data.tasks.filter((task) => task.completed).length / data.tasks.length) * 100);
    }, [data]);

    if (!data) return null;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="ts-xl font-bold">{data.title}</h1>

                <div className="flex items-center gap-5">
                    <IconPlus />
                    <IconDots />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <section className="h-1.5 w-full rounded-full bg-dark-500">
                    <div className="h-full w-1/2 rounded-full bg-dark-50" />
                </section>

                <p className="ts-xs">{percentage}%</p>
            </div>

            <div className="flex flex-col gap-3 pl-3">
                {data.tasks.map(({ title, completed }, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <Checkbox defaultChecked={completed} />

                        <div className="flex flex-col gap-2">{title}</div>
                    </div>
                ))}

                <Button.Small fit>Add New Task</Button.Small>
            </div>
        </div>
    );
};

export default memo(Checklist);
