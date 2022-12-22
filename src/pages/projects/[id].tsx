import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import type { GetServerSideProps } from "next";
import type { cards, card_labels, card_users, lists } from "@prisma/client";
import type { CSSProperties } from "react";
import type { ParsedSSRObjectProps } from "@/lib/types";

import { prisma } from "@/lib/prisma";
import { parseSSRArrayProps, parseSSRObjectProps } from "@/lib/utils";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useCallback, useState } from "react";
import { DragOverlay, DndContext } from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";

type PageProps = {
    lists: ParsedSSRObjectProps<lists>[];
    cards: ParsedSSRObjectProps<
        cards & {
            labels: ParsedSSRObjectProps<card_labels>[];
            users: ParsedSSRObjectProps<card_users>[];
        }
    >[];
};

enum SortableType {
    List = "list",
    Card = "card",
}

const CardPopup = ({ onClose, ...card }: PageProps["cards"][0] & { onClose: () => void }) => {
    return (
        <section className="fixed top-0 left-0 flex h-full w-full items-center justify-center bg-slate-900/75">
            <div className="absolute top-0 left-0 z-10 h-full w-full" onClick={onClose} />

            <div className="relative z-20 flex w-full max-w-4xl flex-col gap-8 rounded-md bg-slate-700 p-10">
                <h1 className="text-3xl font-bold">{card.name}</h1>

                <div className="flex flex-col gap-4">
                    <section className="flex gap-4">
                        <div className="flex gap-2">
                            <span className="material-icons-outlined">group</span>
                            <p className="font-semibold">Users</p>
                        </div>

                        <p>{card.users?.length === 0 ? "No Person Assigned" : <div />}</p>
                    </section>
                </div>
            </div>
        </section>
    );
};

const Card = ({ name, order, isDragOverlay, isDragging }: PageProps["cards"][0] & { isDragOverlay: boolean; isDragging: boolean }) => {
    return (
        <div
            className={`
                group/row relative flex flex-col gap-4 rounded-md bg-slate-800 p-3
                ${isDragging && !isDragOverlay ? "cursor-grab opacity-50" : "cursor-pointer"}
            `}
        >
            <span>
                [{order}] {name}
            </span>

            <div className="flex flex-wrap items-center gap-2">
                {Array(2)
                    .fill(0)
                    .map((_, i) => (
                        <div key={i} className="rounded-md bg-red-500 px-2 py-1 text-xs">
                            Label {i}
                        </div>
                    ))}
            </div>

            <div className="flex flex-wrap items-center -space-x-2">
                {Array(4)
                    .fill(0)
                    .map((_, i) => (
                        <img key={i} src={`https://picsum.photos/200?random=${i}`} alt="User Image" className="h-7 w-7 rounded-full border-2 border-slate-800 object-cover object-center" />
                    ))}
            </div>
        </div>
    );
};

const CardContainer = (props: PageProps["cards"][0]) => {
    const { setNodeRef, listeners, isDragging } = useSortable({
        id: props.id,
        data: {
            ...props,
            type: SortableType.Card,
        },
    });

    return (
        <div {...listeners} ref={setNodeRef}>
            <Card {...props} isDragOverlay={false} isDragging={isDragging} />
        </div>
    );
};

const List = ({ id, name, cards }: PageProps["lists"][0] & { cards: PageProps["cards"] }) => {
    const [cardListRef] = useAutoAnimate<HTMLDivElement>();
    const { setNodeRef, listeners, transform, transition } = useSortable({
        id,
        data: {
            id,
            name,
            type: SortableType.List,
        },
    });

    const style: CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
    };

    return (
        <div
            {...listeners}
            ref={setNodeRef}
            style={style}
            className="group/container relative flex h-max max-h-full w-full max-w-xs cursor-pointer flex-col gap-4 overflow-auto rounded-md bg-slate-700 p-3 text-sm"
        >
            <div className="flex w-full items-center justify-between gap-4">
                <span className="font-semibold">{name}</span>
                <button className="rounded-md bg-white p-2 text-center text-slate-800">New</button>
            </div>

            <div ref={cardListRef} className="hide-scrollbar flex max-h-full flex-col gap-2 overflow-auto px-3">
                <SortableContext strategy={verticalListSortingStrategy} items={cards.sort((a, b) => a.order - b.order).flatMap(({ id }) => id)}>
                    {cards.map((card) => (
                        <CardContainer key={card.id} {...card} />
                    ))}
                </SortableContext>
            </div>

            <button className="rounded-md bg-white p-2 text-center text-slate-800">Add Card</button>
        </div>
    );
};

export const getServerSideProps: GetServerSideProps = async () => {
    const lists = await prisma.lists.findMany({
        orderBy: {
            order: "asc",
        },
    });

    const cards = await prisma.cards.findMany({
        where: {
            list_id: {
                in: lists.map(({ id }) => id),
            },
        },
        orderBy: {
            order: "asc",
        },
        include: {
            labels: true,
            users: true,
        },
    });

    return {
        props: {
            lists: parseSSRArrayProps(lists),
            cards: cards.map((card) => ({
                ...parseSSRObjectProps(card),
                labels: parseSSRArrayProps(card.labels),
                users: parseSSRArrayProps(card.users),
            })),
        } as PageProps,
    };
};

export default function BoardPage({ lists: originalLists, cards: originalCards }: PageProps) {
    const [draggedItem, setDraggedItem] = useState<PageProps["cards"][0] | null>(null);
    const [openedCard, setOpenedCard] = useState<PageProps["cards"][0] | null>(originalCards[0]);

    const [isDragging, setIsDragging] = useState(false);
    const [cardClickTimeout, setCardClickTimeout] = useState<NodeJS.Timeout | null>(null);

    const [lists, setLists] = useState<PageProps["lists"]>(originalLists);
    const [cards, setCards] = useState<PageProps["cards"]>(originalCards);

    const onDragStart = useCallback(
        (event: DragStartEvent) => {
            const current = event.active.data.current;

            if (current?.type === SortableType.Card) {
                const activeCard = cards.find((card) => card.id === event.active.id);

                if (activeCard) {
                    setDraggedItem(activeCard);

                    const clickTimeout = setTimeout(() => {
                        setIsDragging(true);
                    }, 200);

                    setCardClickTimeout(clickTimeout);
                }
            }
        },
        [cards]
    );

    const onDragOver = useCallback(
        (event: DragOverEvent) => {
            const current = event.active.data.current;
            const target = event.over?.data.current;

            if (current?.type === SortableType.Card) {
                let updatedCards: PageProps["cards"] = cards;

                if (target?.type === SortableType.List) {
                    const targetId = target.id;

                    updatedCards = cards.map((card) => {
                        // append on top of the list
                        if (card.id === current.id) {
                            return {
                                ...card,
                                list_id: targetId,
                                order: 0,
                            };
                        }
                        if (card.list_id === targetId) {
                            // move all cards below the current card
                            return {
                                ...card,
                                order: card.order + 1,
                            };
                        }
                        if (card.list_id === current.list_id && card.order > current.order) {
                            // move all cards below the current card
                            return {
                                ...card,
                                order: card.order - 1,
                            };
                        }
                        return card;
                    });
                }

                // Card to Another Card
                if (target?.type === SortableType.Card) {
                    const targetId = target.id;
                    const currentId = current.id;
                    const targetCard = cards.find((card) => card.id === targetId);

                    if (!targetCard) return;

                    if (targetCard.list_id !== current.list_id) {
                        updatedCards = cards.map((card) => {
                            if (card.id === currentId) {
                                return {
                                    ...card,
                                    list_id: targetCard?.list_id,
                                    order: targetCard?.order,
                                };
                            }
                            if (card.list_id === targetCard.list_id && card.order >= targetCard.order) {
                                return {
                                    ...card,
                                    order: card.order + 1,
                                };
                            }
                            return card;
                        });
                    } else {
                        // up to down
                        if (current.order < targetCard.order) {
                            updatedCards = cards.map((card) => {
                                // move the current card to the target card and lower all cards below the target card
                                if (card.id === currentId) {
                                    return {
                                        ...card,
                                        order: targetCard.order,
                                    };
                                }
                                // move all cards below the current card
                                if (card.list_id === targetCard.list_id) {
                                    if (card.order > current.order && card.order <= targetCard.order) {
                                        return {
                                            ...card,
                                            order: card.order - 1,
                                        };
                                    } else if (card.order === targetCard.order || card.order > targetCard.order) {
                                        return {
                                            ...card,
                                            order: card.order + 1,
                                        };
                                    }
                                }
                                return card;
                            });
                        }
                        // down to up
                        if (current.order > targetCard.order) {
                            updatedCards = cards.map((card) => {
                                // move the current card to the target card and lower all cards below the target card
                                if (card.id === currentId) {
                                    return {
                                        ...card,
                                        order: targetCard.order,
                                    };
                                }
                                // move all cards below the current card
                                if (card.list_id === targetCard.list_id) {
                                    if (card.order < current.order && card.order >= targetCard.order) {
                                        return {
                                            ...card,
                                            order: card.order + 1,
                                        };
                                    } else if (card.order === targetCard.order || card.order < targetCard.order) {
                                        return {
                                            ...card,
                                            order: card.order - 1,
                                        };
                                    }
                                }
                                return card;
                            });
                        }
                    }
                }

                let sortIndex: Record<string, number> = {};
                updatedCards
                    .sort((a, b) => a.order - b.order)
                    .map((card) => {
                        if (typeof sortIndex[card.list_id] !== "undefined") {
                            sortIndex[card.list_id] += 1;
                        } else {
                            sortIndex[card.list_id] = 0;
                        }
                        card.order = sortIndex[card.list_id];
                        return card;
                    });

                setCards(updatedCards);
            }
        },
        [cards]
    );

    const onDragEnd = useCallback(
        (event: DragEndEvent) => {
            if (cardClickTimeout) {
                clearTimeout(cardClickTimeout);
            }

            if (!isDragging) {
                setOpenedCard(draggedItem);
            }

            setIsDragging(false);
            setDraggedItem(null);

            const current = event.active.data.current;
            const target = event.over?.data.current;

            // List to Another List
            if (current?.type === SortableType.List && target?.type === SortableType.List) {
                const targetId = target.id;
                const currentId = current.id;

                const currentList = lists.find((list) => list.id === currentId);
                const targetList = lists.find((list) => list.id === targetId);

                if (!currentList || !targetList) return;

                if (currentList.order < targetList.order) {
                    setLists((lists) => {
                        return lists.map((list) => {
                            if (list.id === currentId) {
                                return {
                                    ...list,
                                    order: targetList.order,
                                };
                            }
                            if (list.order > currentList.order && list.order <= targetList.order) {
                                return {
                                    ...list,
                                    order: list.order - 1,
                                };
                            }
                            return list;
                        });
                    });
                } else {
                    setLists((lists) => {
                        return lists.map((list) => {
                            if (list.id === currentId) {
                                return {
                                    ...list,
                                    order: targetList.order,
                                };
                            }
                            if (list.order < currentList.order && list.order >= targetList.order) {
                                return {
                                    ...list,
                                    order: list.order + 1,
                                };
                            }
                            return list;
                        });
                    });
                }
            }
        },
        [cardClickTimeout, draggedItem, isDragging, lists]
    );

    const onPopupClose = useCallback(() => {
        setOpenedCard(null);
    }, []);

    return (
        <main className="relative flex h-screen min-h-screen w-screen flex-col items-center overflow-auto bg-slate-900 text-white">
            <section className="flex w-full items-center justify-between bg-slate-800/75 px-20 py-5">
                <img src="https://britonenglish.co.id/images/logo-light.png" alt="Logo" className="h-8" />

                <div className="flex items-center gap-8">
                    <span className="material-icons-outlined">people</span>
                    <span className="material-icons-outlined">notifications</span>

                    <div className="flex items-center gap-4 rounded-md bg-slate-700 px-3 py-2">
                        <img src="https://picsum.photos/200" alt="User Image" className="h-7 rounded-full" />
                        <p className="text-sm font-semibold">John Doe</p>
                    </div>
                </div>
            </section>

            <section className="flex max-h-full w-full max-w-full flex-1 justify-start gap-8 overflow-auto py-5 px-20">
                <DndContext onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
                    <SortableContext items={lists.sort((a, b) => a.order - b.order).flatMap(({ id }) => id)} strategy={horizontalListSortingStrategy}>
                        {lists.map((list) => {
                            return <List key={list.id} {...list} cards={cards.filter((c) => c.list_id === list.id)} />;
                        })}
                    </SortableContext>

                    {draggedItem && (
                        <DragOverlay>
                            <Card {...draggedItem} isDragOverlay={true} isDragging={false} />
                        </DragOverlay>
                    )}
                </DndContext>
            </section>

            {openedCard && <CardPopup {...openedCard} onClose={onPopupClose} />}
        </main>
    );
}
