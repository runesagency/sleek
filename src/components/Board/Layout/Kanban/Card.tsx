import type { PageProps } from "@/pages/projects/[id]";

import { SortableType } from ".";

import useMenu from "@/lib/hooks/use-menu";
import useCustomEvent from "@/lib/hooks/use-custom-event";

import { useCallback, useState } from "react";
import { IconDots } from "@tabler/icons";
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
                    className="group/card relative flex max-w-full flex-col gap-5 overflow-hidden rounded-lg border border-dark-500 bg-dark-600 px-5 py-4 duration-200"
                >
                    {/* <img src={"https://picsum.photos/200/300"} alt="Card Cover" className="h-40 w-full rounded-lg object-cover object-center" loading="lazy" /> */}

                    <div className="flex max-w-full items-start justify-between gap-2 overflow-hidden">
                        <span className="flex-1 break-words font-semibold">
                            {order} - {name}
                        </span>

                        <div
                            className="hidden h-4 w-4 shrink-0 items-center justify-center rounded-md hover:opacity-75 group-hover/card:flex"
                            onMouseOver={() => setIsOnMenuButton(true)}
                            onMouseLeave={() => setIsOnMenuButton(false)}
                            onClick={toggleMenu}
                        >
                            <IconDots
                                className="hidden h-4 w-4 shrink-0 items-center justify-center rounded-md hover:opacity-75 group-hover/card:flex"
                                onMouseOver={() => setIsOnMenuButton(true)}
                                onMouseLeave={() => setIsOnMenuButton(false)}
                                onClick={toggleMenu}
                            />
                        </div>
                    </div>

                    {/* <div className="flex flex-wrap items-center gap-2">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="rounded-full bg-dark-800 px-2 py-1 text-xs">
                                    {i}
                                </div>
                            ))}
                        </div> */}

                    {/* <section className="flex items-end justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <IconMessageDots height={15} />
                                    <p>{activities.length}</p>
                                </div>

                                <div className="flex items-center gap-1">
                                    <IconPaperclip height={15} />
                                    <p>{attachments.length}</p>
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
                        </section> */}
                </div>
            )}
        </Draggable>
    );
};
