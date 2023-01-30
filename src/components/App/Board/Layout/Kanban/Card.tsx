import type { Card as CardType } from "@/lib/types";

import { SortableType } from ".";

import Label from "@/components/DataDisplay/Label";
import Button from "@/components/Forms/Button";
import useDraggable from "@/lib/hooks/drag-and-drop/use-draggable";
import useCustomEvent from "@/lib/hooks/use-custom-event";
import useLatest from "@/lib/hooks/use-latest";
import useMenu from "@/lib/hooks/use-menu";

import { IconCalendar, IconChevronDown, IconDots, IconMessageDots, IconPaperclip } from "@tabler/icons";
import { useCallback, useRef, useState, memo, useEffect } from "react";

type TasksProgressProps = {
    checklists: CardType["checklists"];
    innerRef?: React.Ref<HTMLButtonElement>;
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

                <p className="text-xs">{percentage}%</p>

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

type CardProps = CardType & {
    isDragging: boolean;
    setIsDragging: (isDragging: boolean) => void;
};

const Card = ({ id, title, attachments, activities, cover, checklists, labels, due_date, users, setIsDragging }: CardProps) => {
    const { ref: cardRef, isDragging } = useDraggable<HTMLAnchorElement>({
        id,
        type: SortableType.Card,
    });

    const isActuallyDragging = useLatest(isDragging);

    const { emit } = useCustomEvent<string>("card-clicked", false);
    const { openMenu, closeMenu, toggleMenu } = useMenu();

    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const taskButtonRef = useRef<HTMLButtonElement>(null);

    const onCardClick = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>) => {
            e.preventDefault();

            // if e.target is Menu or Task List button or its children, return
            if (menuButtonRef.current?.contains(e.target as Node)) return;
            if (taskButtonRef.current?.contains(e.target as Node)) return;

            emit(id);
            closeMenu();
        },
        [closeMenu, emit, id]
    );

    const onCardTouch = useCallback(
        (e: React.TouchEvent<HTMLAnchorElement>) => {
            e.preventDefault();

            setTimeout(() => {
                if (isActuallyDragging.current) return;
                onCardClick(e as unknown as React.MouseEvent<HTMLAnchorElement>);
            }, 200);
        },
        [isActuallyDragging, onCardClick]
    );

    useEffect(() => {
        setIsDragging(isDragging);
    }, [isDragging, setIsDragging]);

    return (
        <a
            ref={cardRef}
            onContextMenu={openMenu}
            onClick={onCardClick}
            onTouchStart={onCardTouch}
            className={`
                group/card relative flex max-w-full !cursor-pointer flex-col gap-5 rounded-lg border border-dark-500 bg-dark-600 px-5 py-4 font-manrope text-white hover:border-dark-400
                ${isDragging && "opacity-30"}
            `}
        >
            {/* Cover Image */}
            {cover && <img src={cover.filename_disk} alt="Card Cover" className="h-40 w-full rounded-lg object-cover object-center" loading="lazy" />}

            {/* Head */}
            <div className="flex max-w-full items-start justify-between gap-2">
                <span className="flex-1 break-words font-semibold">{title}</span>

                <button ref={menuButtonRef} className="hidden group-hover/card:block">
                    <IconDots height={20} width={undefined} onClick={toggleMenu} />
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
            {due_date && (
                <section className="flex items-end justify-between gap-4">
                    {due_date && (
                        <Button.Small className="overflow-hidden !bg-dark-700" icon={IconCalendar} fit>
                            <p className="truncate text-xs">{due_date}</p>
                        </Button.Small>
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
        </a>
    );
};

export default memo(Card);
