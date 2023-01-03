import type { PageProps } from "@/pages/projects/[id]";

import useMenu from "@/lib/hooks/use-menu";
import useCustomEvent from "@/lib/hooks/use-custom-event";

import { useCallback, useState } from "react";
import { IconDots, IconMessageDots, IconPaperclip } from "@tabler/icons";
import { Draggable } from "react-beautiful-dnd";

type CardContainerProps = PageProps["cards"][0];

export const Card = (props: CardContainerProps) => {
    const { name, cover_attachment_id, attachments, labels, users, activities, order } = props;

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
        <Draggable draggableId={props.id} index={props.order}>
            {(provided) => (
                <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    onContextMenu={openMenu}
                    onClick={onCardClick}
                    className="group/card relative my-2 flex max-w-full !cursor-pointer flex-col gap-5 rounded-lg border border-dark-500 bg-dark-600 px-5 py-4"
                >
                    <img src={"https://picsum.photos/200/300"} alt="Card Cover" className="h-40 w-full rounded-lg object-cover object-center" loading="lazy" />

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

                    <div className="flex flex-wrap items-center gap-2">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="rounded-full bg-dark-800 px-2 py-1 text-xs">
                                {i}
                            </div>
                        ))}
                    </div>

                    <section className="flex items-end justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <IconMessageDots height={16} />
                                <p>{activities.length}</p>
                            </div>

                            <div className="flex items-center gap-1">
                                <IconPaperclip height={16} />
                                <p>{attachments.length}</p>
                            </div>
                        </div>

                        <div className="box-border flex shrink-0 flex-wrap items-center -space-x-2">
                            {[...Array(20)].map((_, i) => {
                                if (i > 4) return null;

                                return (
                                    <img
                                        key={i}
                                        src={`https://ui-avatars.com/api/?background=random&name=${i}`}
                                        alt={""}
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
