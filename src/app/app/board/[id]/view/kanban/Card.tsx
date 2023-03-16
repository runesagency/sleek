"use client";

import type { BoardCard } from "@/app/app/board/[id]/layout";
import type { CardChecklist, CardChecklistTask } from "@prisma/client";

import { BoardLayoutContext } from "@/app/app/board/[id]/layout";
import { SortableType } from "@/app/app/board/[id]/view/kanban/page";
import Label from "@/components/DataDisplay/Label";
import MemberList from "@/components/DataDisplay/MemberList";
import { Button } from "@/components/Forms";
import { Draggable } from "@/lib/drag-and-drop";

import { IconCalendar, IconChevronDown, IconDots, IconMessageDots, IconPaperclip } from "@tabler/icons";
import clsx from "clsx";
import { useCallback, useRef, useState, memo, useContext } from "react";

export type TasksProgressProps = {
    innerRef?: React.Ref<HTMLButtonElement>;
    checklists: (CardChecklist & {
        tasks: CardChecklistTask[];
    })[];
};

const TasksProgress = ({ checklists, innerRef }: TasksProgressProps) => {
    const [open, setOpen] = useState(false);

    const tasks = checklists.flatMap((checklist) => checklist?.tasks ?? []);
    const percentage = Math.round((tasks.filter(({ completed }) => completed).length / tasks.length) * 100) || 0;

    const maxTasks = 4;
    const shownTasks = tasks.slice(0, maxTasks);
    const hiddenTasksTotal = tasks.slice(maxTasks).length;

    const onToggle = useCallback(() => {
        setOpen((prev) => !prev);
    }, []);

    if (tasks.length === 0) return null;

    return (
        <section className="flex flex-col gap-2">
            <button ref={innerRef} className="flex items-center gap-3 duration-200 hover:opacity-75" onClick={onToggle}>
                <section className="h-1.5 w-full rounded-full bg-dark-500">
                    <div className="h-full rounded-full bg-dark-50" style={{ width: `${percentage}%` }} />
                </section>

                <p className="ts-xs">{percentage}%</p>

                <IconChevronDown width={undefined} className={open ? "rotate-180" : "rotate-0"} />
            </button>

            {open && (
                <ul className="origin-top list-disc">
                    {shownTasks.map(({ title }, i) => (
                        <li key={i} className="ml-6">
                            {title}
                        </li>
                    ))}

                    {hiddenTasksTotal > 0 && <li className="ml-6">{hiddenTasksTotal} more...</li>}
                </ul>
            )}
        </section>
    );
};

const Card = (data: BoardCard) => {
    const { id, title, attachments, activities, coverAttachmentId, checklists, labels, dueDate, users } = data;
    const { setActiveCard } = useContext(BoardLayoutContext);

    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const taskButtonRef = useRef<HTMLButtonElement>(null);

    const onClickOrTouch = useCallback(
        (e: MouseEvent | TouchEvent) => {
            e.preventDefault();

            // if it was a right click, return
            if (e instanceof MouseEvent && e.button === 2) return;

            // if e.target is Menu or Task List button or its children, return
            if (menuButtonRef.current?.contains(e.target as Node)) return;
            if (taskButtonRef.current?.contains(e.target as Node)) return;

            setActiveCard(data);
        },
        [data, setActiveCard]
    );

    return (
        <Draggable<HTMLAnchorElement> id={id} type={SortableType.Card} onClickOrTouch={onClickOrTouch}>
            {({ ref }, { isDragging }) => (
                <a
                    ref={ref}
                    className={clsx(
                        "group/card relative flex max-w-full !cursor-pointer flex-col gap-5 rounded-lg border border-dark-500 bg-dark-600 px-5 py-4 font-manrope text-dark-50 hover:border-dark-400",
                        isDragging && "opacity-30"
                    )}
                >
                    {/* Cover Image */}
                    {coverAttachmentId && <img src={coverAttachmentId} alt="Card Cover" className="h-40 w-full rounded-lg object-cover object-center" loading="lazy" />}

                    {/* Head */}
                    <div className="flex max-w-full items-start justify-between gap-2">
                        <span className="flex-1 break-words font-semibold">{title}</span>

                        <button ref={menuButtonRef} className="hidden group-hover/card:block">
                            <IconDots height={20} width={undefined} />
                        </button>
                    </div>

                    {/* Labels */}
                    {labels.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            {labels.map(({ label }, i) => {
                                if (!label) return null;

                                return <Label key={i} color={label.color} name={label.name} />;
                            })}
                        </div>
                    )}

                    {/* Progress (Tasks) */}
                    {checklists.length > 0 && <TasksProgress innerRef={taskButtonRef} checklists={checklists} />}

                    {/* Dates & Timer */}
                    {dueDate && (
                        <section className="flex items-end justify-between gap-4">
                            {dueDate && (
                                <Button.Small className="overflow-hidden !bg-dark-700" icon={IconCalendar} fit>
                                    <p className="ts-xs truncate">{dueDate.toString()}</p>
                                </Button.Small>
                            )}

                            {/* <ButtonSmall className="!bg-dark-700 ts-xs" icon={IconHourglass}>
                                    <p>01:35:10</p>
                                </ButtonSmall> */}
                        </section>
                    )}

                    {/* Footer */}
                    {(activities.length > 0 || attachments.length > 0 || users.length > 0) && (
                        <section className="flex items-center justify-between gap-4">
                            {(activities.length > 0 || attachments.length > 0) && (
                                <div className="flex items-center gap-4">
                                    {activities.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <IconMessageDots height={16} width={undefined} />
                                            <p className="ts-xs">{activities.length}</p>
                                        </div>
                                    )}

                                    {attachments.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <IconPaperclip height={16} width={undefined} />
                                            <p className="ts-xs">{attachments.length}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {users.length > 0 && (
                                <div className="box-border flex shrink-0 flex-wrap items-center -space-x-2">
                                    <MemberList.Small users={users} max={5} />
                                </div>
                            )}
                        </section>
                    )}
                </a>
            )}
        </Draggable>
    );
};

export default memo(Card);
