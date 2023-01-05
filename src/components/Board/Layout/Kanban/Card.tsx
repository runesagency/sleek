import type { PageProps } from "@/pages/projects/[id]";

import useMenu from "@/lib/hooks/use-menu";
import useCustomEvent from "@/lib/hooks/use-custom-event";
import { Small as ButtonSmall } from "@/components/Forms/Button";

import { useCallback, useState } from "react";
import { IconCalendar, IconChevronDown, IconDots, IconHourglass, IconMessageDots, IconPaperclip } from "@tabler/icons";
import { Draggable } from "react-beautiful-dnd";

const TasksProgress = () => {
    const [open, setOpen] = useState(false);

    const onToggle = useCallback(() => {
        setOpen((prev) => !prev);
    }, []);

    return (
        <section className="flex flex-col gap-2">
            <div className="flex items-center gap-3" onClick={onToggle}>
                <section className="h-1.5 w-full rounded-full bg-dark-500">
                    <div className="h-full w-1/2 rounded-full bg-dark-50" />
                </section>

                <p className="text-xs">69%</p>

                <IconChevronDown width={undefined} className={open ? "rotate-180" : "rotate-0"} />
            </div>

            <ul className={`origin-top list-disc ${open ? "h-auto scale-y-100" : "h-0 scale-y-0"} duration-200`}>
                {[...Array(5)].map((_, i) => (
                    <li key={i} className="ml-6">
                        {i}
                    </li>
                ))}
            </ul>
        </section>
    );
};

export const Card = (props: PageProps["cards"][0]) => {
    const { name, cover_attachment_id, attachments, id, activities, order } = props;

    const cardCover = cover_attachment_id && attachments.find(({ id }) => id === cover_attachment_id);

    const { emit } = useCustomEvent<PageProps["cards"][0]>("card-clicked", false);
    const [isOnMenuButton, setIsOnMenuButton] = useState(false);
    const { openMenu, closeMenu, toggleMenu } = useMenu({
        items: () => {
            return <div>123</div>;
        },
    });

    const onCardClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            e.preventDefault();

            if (!isOnMenuButton) {
                emit(props);
                closeMenu();
            }
        },
        [closeMenu, isOnMenuButton, emit, props]
    );

    return (
        <Draggable draggableId={id} index={order}>
            {(provided, snapshot) => (
                <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    onContextMenu={openMenu}
                    // onClick={onCardClick}
                    className={`
                        group/card relative my-2 flex max-w-full !cursor-pointer flex-col gap-5 rounded-lg border bg-dark-600 px-5 py-4 hover:border-dark-400
                        ${snapshot.isDragging ? "border-dark-400" : "border-dark-500"}
                        ${!snapshot.isDropAnimating && "duration-200"}
                    `}
                >
                    {/* Cover Image */}
                    <img src="https://picsum.photos/200/300" alt="Card Cover" className="h-40 w-full rounded-lg object-cover object-center" loading="lazy" />

                    {/* Head */}
                    <div className="flex max-w-full items-start justify-between gap-2">
                        <span className="flex-1 break-words font-semibold">{name}</span>

                        <div
                            className="hidden h-4 w-4 shrink-0 items-center justify-center rounded-md hover:opacity-75 group-hover/card:flex"
                            onMouseOver={() => setIsOnMenuButton(true)}
                            onMouseLeave={() => setIsOnMenuButton(false)}
                            onClick={toggleMenu}
                        >
                            <IconDots />
                        </div>
                    </div>

                    {/* Labels */}
                    <div className="flex flex-wrap items-center gap-2">
                        {["🤑", "Cuan Gede", "Front-end 😁", "!!!Important", "Pokoknya Kerjain", "( ͡° ͜ʖ ͡°)", "12-04-2026"].map((label, i) => (
                            <div key={i} className="rounded-full bg-dark-800 px-2 py-1 text-xs">
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Progress (Tasks) */}
                    <TasksProgress />

                    {/* Dates & Timer */}
                    <section className="flex items-end justify-between gap-4">
                        <ButtonSmall className=" overflow-hidden !bg-dark-700" icon={IconCalendar}>
                            <p className="truncate text-xs">12 Jan 2023 - 35 Feb 306as9</p>
                        </ButtonSmall>

                        <ButtonSmall className="!bg-dark-700 text-xs" icon={IconHourglass}>
                            <p>01:35:10</p>
                        </ButtonSmall>
                    </section>

                    {/* Footer */}
                    <section className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <IconMessageDots height={16} width={undefined} />
                                <p className="text-xs">{activities.length}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <IconPaperclip height={16} width={undefined} />
                                <p className="text-xs">{attachments.length}</p>
                            </div>
                        </div>

                        <div className="box-border flex shrink-0 flex-wrap items-center -space-x-2">
                            {[...Array(20)].map((_, i) => {
                                if (i > 4) return null;

                                return (
                                    <img
                                        key={i}
                                        src={`https://ui-avatars.com/api/?background=random&name=${i}`}
                                        alt=""
                                        // title={user.name}
                                        className="box-border h-6 w-6 rounded-full border border-dark-600 object-cover object-center"
                                    />
                                );
                            })}
                        </div>
                    </section>
                </div>
            )}
        </Draggable>
    );
};
