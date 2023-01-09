import type { PageProps } from "@/pages/projects/[id]";
import type { CSSProperties } from "react";

import { SortableType } from ".";

import useMenu from "@/lib/hooks/use-menu";
import useCustomEvent from "@/lib/hooks/use-custom-event";
import { Small as ButtonSmall } from "@/components/Forms/Button";
import Label from "@/components/DataDisplay/Label";

import { useSortable } from "@dnd-kit/sortable";
import { useCallback, useRef, useState } from "react";
import { IconCalendar, IconChevronDown, IconDots, IconMessageDots, IconPaperclip } from "@tabler/icons";

const TasksProgress = ({ checklists }: { checklists: PageProps["cards"][0]["checklists"] }) => {
    const [open, setOpen] = useState(false);

    const tasks = checklists.flatMap(({ checklist }) => checklist).flatMap((checklist) => checklist?.tasks ?? []);
    const percentage = Math.round((tasks.filter(({ completed }) => completed).length / tasks.length) * 100);
    const shownTasks = tasks.slice(0, 7);
    const hiddenTasks = tasks.slice(7);

    const onToggle = useCallback(() => {
        setOpen((prev) => !prev);
    }, []);

    return (
        <section className="flex flex-col gap-2">
            <div className="flex items-center gap-3" onClick={onToggle}>
                <section className="h-1.5 w-full rounded-full bg-dark-500">
                    <div className="h-full w-1/2 rounded-full bg-dark-50" />
                </section>

                <p className="text-xs">{percentage}</p>

                <IconChevronDown width={undefined} className={open ? "rotate-180" : "rotate-0"} />
            </div>

            <ul className={`origin-top list-disc ${open ? "h-auto scale-y-100" : "h-0 scale-y-0"} duration-200`}>
                {shownTasks.map(({ text }, i) => (
                    <li key={i} className="ml-6">
                        {text}
                    </li>
                ))}

                {hiddenTasks.length > 0 && <li className="ml-6">{hiddenTasks.length} more...</li>}
            </ul>
        </section>
    );
};

export const Card = ({ id, title, attachments, activities, cover, checklists, labels, due_date, users, isDragging }: PageProps["cards"][0] & { isDragging: boolean }) => {
    const menuButtonRef = useRef<HTMLDivElement>(null);
    const { emit } = useCustomEvent<string>("card-clicked", false);

    const { openMenu, closeMenu, toggleMenu } = useMenu();

    const onCardClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();

            // if e.target is menuButtonRef.current or its children, return
            if (menuButtonRef.current?.contains(e.target as Node)) return;

            emit(id);
            closeMenu();
        },
        [closeMenu, emit, id]
    );

    return (
        <div
            onContextMenu={openMenu}
            onClick={onCardClick}
            className={`
                group/card relative flex max-w-full !cursor-pointer flex-col gap-5 rounded-lg border border-dark-500 bg-dark-600 px-5 py-4 hover:border-dark-400 
                ${isDragging && "opacity-30"}
            `}
        >
            {/* Cover Image */}
            {cover && <img src={cover.attachment.filename_disk} alt="Card Cover" className="h-40 w-full rounded-lg object-cover object-center" loading="lazy" />}

            {/* Head */}
            <div className="flex max-w-full items-start justify-between gap-2">
                <span className="flex-1 break-words font-semibold">{title}</span>

                <div ref={menuButtonRef} className="hidden group-hover/card:block">
                    <IconDots height={20} width={undefined} onClick={toggleMenu} />
                </div>
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
            {checklists.length > 0 && <TasksProgress checklists={checklists} />}

            {/* Dates & Timer */}
            {due_date && (
                <section className="flex items-end justify-between gap-4">
                    {due_date && (
                        <ButtonSmall className="overflow-hidden !bg-dark-700" icon={IconCalendar} fit>
                            <p className="truncate text-xs">{due_date}</p>
                        </ButtonSmall>
                    )}

                    {/* <ButtonSmall className="!bg-dark-700 text-xs" icon={IconHourglass}>
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
                                    <p className="text-xs">{activities.length}</p>
                                </div>
                            )}

                            {attachments.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <IconPaperclip height={16} width={undefined} />
                                    <p className="text-xs">{attachments.length}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {users.length > 0 && (
                        <div className="box-border flex shrink-0 flex-wrap items-center -space-x-2">
                            {users.map(({ user }, i) => {
                                if (!user || i > 5) return null;

                                const title = i !== 5 ? user.name : `${users.length - 5} more...`;
                                const initials =
                                    i !== 5
                                        ? user.name
                                              .split(" ")
                                              .map((name) => name[0])
                                              .join("")
                                        : `+${users.length - 5}`;

                                return (
                                    <img
                                        key={i}
                                        src={`https://ui-avatars.com/api/?background=random&name=${initials}`}
                                        alt={title}
                                        title={title}
                                        loading="lazy"
                                        className="box-border h-6 w-6 rounded-full border border-dark-600 object-cover object-center"
                                    />
                                );
                            })}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export const CardContainer = (props: PageProps["cards"][0]) => {
    const { id, order } = props;

    const { setNodeRef, listeners, isDragging, transform, transition } = useSortable({
        id,
        data: {
            id,
            order,
            type: SortableType.Card,
        },
    });

    const style: CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
    };

    return (
        <div {...listeners} ref={setNodeRef} style={style}>
            <Card {...props} isDragging={isDragging} />
        </div>
    );
};
