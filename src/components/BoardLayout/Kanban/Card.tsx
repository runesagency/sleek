import type { PageProps } from "@/pages/projects/[id]";

import { SortableType } from ".";

import { useSortable } from "@dnd-kit/sortable";
import { useCallback } from "react";
import { IconMessageDots, IconPaperclip, IconUsers } from "@tabler/icons";

export const CardPopup = ({ onClose, ...card }: PageProps["cards"][0] & { onClose: () => void }) => {
    return (
        <section className="fixed top-0 left-0 flex h-full w-full items-center justify-center bg-dark-900/75">
            <div className="absolute top-0 left-0 z-10 h-full w-full" onClick={onClose} />

            <div className="relative z-20 flex w-full max-w-4xl flex-col gap-8 rounded-md bg-dark-700 p-10">
                <h1 className="text-3xl font-bold">{card.name}</h1>

                <div className="flex flex-col gap-4">
                    <section className="flex gap-4">
                        <div className="flex gap-2">
                            <IconUsers height={20} />
                            <p className="font-semibold">Users</p>
                        </div>

                        <p>{card.users?.length === 0 ? "No Person Assigned" : <div />}</p>
                    </section>
                </div>
            </div>
        </section>
    );
};

export const Card = ({ name, isDragOverlay, isDragging, cover_attachment_id, attachments, labels, users, activities }: PageProps["cards"][0] & { isDragOverlay: boolean; isDragging: boolean }) => {
    const cardCover = cover_attachment_id && attachments.find(({ id }) => id === cover_attachment_id);

    return (
        <div
            className={`
                group/row relative flex flex-col gap-4 rounded-md border border-dark-600 bg-dark-700 p-3 drop-shadow-xl duration-200 hover:border-dark-500
                ${isDragging && !isDragOverlay ? "cursor-grab opacity-50" : "cursor-pointer"}
            `}
        >
            {cardCover && <img src={cardCover.url} alt="Card Cover" className="h-28 rounded-md object-cover object-center" loading="lazy" />}

            <span className="font-semibold">{name}</span>

            {labels?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    {labels.map(({ label }, i) => (
                        <div key={i} className="rounded-md px-2 py-1 text-xs" style={{ backgroundColor: label.color }}>
                            {label.name}
                        </div>
                    ))}
                </div>
            )}

            <section className="flex items-end justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <IconMessageDots height={15} />
                        <p>{activities?.length || 0}</p>
                    </div>

                    <div className="flex items-center gap-1">
                        <IconPaperclip height={15} />
                        <p>{attachments?.length || 0}</p>
                    </div>
                </div>

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
        </div>
    );
};

export const CardContainer = ({ onCardClick, ...props }: PageProps["cards"][0] & { onCardClick: (card: PageProps["cards"][0]) => void }) => {
    const { setNodeRef, listeners, isDragging } = useSortable({
        id: props.id,
        data: {
            ...props,
            type: SortableType.Card,
        },
    });

    const onClick = useCallback(() => {
        onCardClick(props);
    }, [props, onCardClick]);

    return (
        <div {...listeners} ref={setNodeRef} onClick={onClick}>
            <Card {...props} isDragOverlay={false} isDragging={isDragging} />
        </div>
    );
};
