import type { PageProps } from "@/pages/projects/[id]";

import { SortableType } from ".";

import useMenu from "@/lib/hooks/use-menu";
import useCustomEvent from "@/lib/hooks/use-custom-event";

import { useCallback, useEffect, useState } from "react";
import { IconDots, IconMessageDots, IconPaperclip, IconTags, IconUsers } from "@tabler/icons";
import { useDebouncedState } from "@mantine/hooks";
import { Draggable } from "react-beautiful-dnd";

type CardPopupProps = {
    onUpdated: (card: PageProps["cards"][0]) => void;
};

export const CardPopup = ({ onUpdated }: CardPopupProps) => {
    const { data: card } = useCustomEvent<PageProps["cards"][0]>("card-clicked", false);
    const [open, setOpen] = useState(false);
    const [updatedTitle, setUpdatedTitle] = useDebouncedState("", 200);

    const onTitleChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            event.target.style.height = "0px";
            event.target.style.height = event.target.scrollHeight + "px";

            setUpdatedTitle(event.target.value);
        },
        [setUpdatedTitle]
    );

    useEffect(() => {
        if (card) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [card]);

    return (
        <div>
            {card && (
                <div className="relative z-20 flex w-full max-w-4xl flex-col gap-8 rounded-md bg-dark-700 p-10">
                    <textarea
                        placeholder="Enter Your Card Title Here..."
                        rows={1}
                        className="hide-scrollbar resize-none bg-transparent text-3xl font-bold focus:outline-none"
                        defaultValue={card.name}
                        autoFocus
                        onChange={onTitleChange}
                    />

                    <div className="flex flex-wrap gap-4" />
                </div>
            )}
        </div>
    );
};

type CardProps = PageProps["cards"][0] & {
    isDragOverlay: boolean;
};

export const Card = (props: CardProps) => {
    const { name, isDragOverlay, cover_attachment_id, attachments, labels, users, activities, order } = props;
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
        <div
            onContextMenu={openMenu}
            onClick={onCardClick}
            className={`
                group/card relative flex max-w-full flex-col gap-4 overflow-hidden rounded-md border border-dark-600 bg-dark-700 p-3 drop-shadow-xl duration-200 hover:border-dark-400
                ${!isDragOverlay ? "cursor-grab opacity-50" : "cursor-pointer"}
            `}
        >
            {cardCover && <img src={cardCover.url} alt="Card Cover" className="h-28 rounded-md object-cover object-center" loading="lazy" />}

            <div className="flex max-w-full items-center justify-between gap-2 overflow-hidden">
                <span className="break-words py-1">
                    {order} | {name}
                </span>

        <Draggable draggableId={props.id} index={props.order}>
            {(provided) => (
                <div
                    className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md bg-dark-800 p-1 hover:opacity-75 group-hover/card:flex"
                    onMouseOver={() => setIsOnMenuButton(true)}
                    onMouseLeave={() => setIsOnMenuButton(false)}
                    onClick={toggleMenu}
                >
                    <IconDots className="w-full" />
                </div>
            </div>

            {labels?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    {labels.map(({ label }, i) => (
                        <div key={i} className="rounded-md px-2 py-1 text-xs" style={{ backgroundColor: label.color }}>
                            {label.name}
                        </div>
                    ))}
                </div>
            )}

            {(users.length > 0 || activities?.length > 0 || attachments?.length > 0) && (
                <section className="flex items-end justify-between gap-4">
                    {(activities?.length > 0 || attachments?.length > 0) && (
                        <div className="flex items-center gap-4">
                            {activities?.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <IconMessageDots height={15} />
                                    <p>{activities.length}</p>
                                </div>
                            )}

                            {attachments?.length > 0 && (
                                <div className="flex items-center gap-1">
                                    <IconPaperclip height={15} />
                                    <p>{attachments.length}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex shrink-0 flex-wrap items-center -space-x-2">
                        {users.map(({ user }, i) => (
                            <div key={i} className="h-7 w-7 overflow-hidden rounded-full border-2 border-dark-700">
                                <img
                                    src={user.image_url || `https://ui-avatars.com/api/?background=random&name=${encodeURI(user.name)}`}
                                    alt={user.name}
                                    title={user.name}
                                    className="object-cover object-center"
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

type CardContainerProps = PageProps["cards"][0];

export const CardContainer = (props: CardContainerProps) => {
    return (
        <Draggable draggableId={props.id} index={props.order}>
            {(draggableProvided, draggableSnapshot) => (
                <div {...draggableProvided.draggableProps} {...draggableProvided.dragHandleProps} ref={draggableProvided.innerRef}>
                    <Card {...props} isDragOverlay={false} />
                </div>
            )}
        </Draggable>
    );
};
