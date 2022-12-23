import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import type { PageProps } from "@/pages/projects/[id]";

import { List } from "@/components/BoardLayout/Kanban/List";
import { Card, CardPopup } from "@/components/BoardLayout/Kanban/Card";

import { PointerSensor, useSensor, useSensors, DragOverlay, DndContext } from "@dnd-kit/core";
import { useCallback, useState } from "react";
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";

export enum SortableType {
    List = "list",
    Card = "card",
}

export default function KanbanLayout({ lists: originalLists, cards: originalCards }: PageProps) {
    const [draggedItem, setDraggedItem] = useState<PageProps["cards"][0] | null>(null);
    const [openedCard, setOpenedCard] = useState<PageProps["cards"][0] | null>(null);

    const [lists, setLists] = useState<PageProps["lists"]>(originalLists);
    const [cards, setCards] = useState<PageProps["cards"]>(originalCards);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 2,
            },
        })
    );

    const onDragStart = useCallback(
        (event: DragStartEvent) => {
            const current = event.active.data.current;

            if (current?.type === SortableType.Card) {
                const activeCard = cards.find((card) => card.id === event.active.id);

                if (activeCard) {
                    setDraggedItem(activeCard);
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
        [lists]
    );

    const onPopupClose = useCallback(() => {
        setOpenedCard(null);
    }, []);

    return (
        <>
            <section className="flex max-h-full w-full max-w-full flex-1 justify-start gap-8 overflow-auto py-5 px-20">
                <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
                    <SortableContext items={lists.sort((a, b) => a.order - b.order).flatMap(({ id }) => id)} strategy={horizontalListSortingStrategy}>
                        {lists.map((list) => {
                            return <List key={list.id} {...list} cards={cards.filter((c) => c.list_id === list.id)} onCardClick={setOpenedCard} />;
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
        </>
    );
}
