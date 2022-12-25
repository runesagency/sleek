import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import type { PageProps } from "@/pages/projects/[id]";

import { List } from "@/components/BoardLayout/Kanban/List";
import { Card, CardPopup } from "@/components/BoardLayout/Kanban/Card";

import { PointerSensor, useSensor, useSensors, DragOverlay, DndContext } from "@dnd-kit/core";
import { useCallback, useState } from "react";
import { arrayMove, horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";

export enum SortableType {
    List = "list",
    Card = "card",
}

export default function KanbanLayout({ lists: originalLists, cards: originalCards }: PageProps) {
    const [draggedItem, setDraggedItem] = useState<PageProps["cards"][0] | null>(null);

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

            if (current?.type === SortableType.Card && target && current) {
                const targetId: string = target.id;
                const currentId: string = current.id;

                let updatedCards: PageProps["cards"] = cards;

                const targetCard = cards.find((card) => card.id === targetId);
                const currentCard = cards.find((card) => card.id === currentId);

                if (!targetCard || !currentCard) return;

                // Card to List
                if (target?.type === SortableType.List) {
                    updatedCards = cards.map((card) => {
                        // append on top of the list
                        if (card.id === currentId) {
                            return {
                                ...card,
                                list_id: targetId,
                                order: 0,
                            };
                        }

                        // move down all cards on the new list under the current (new) card
                        if (card.list_id === targetId) {
                            return {
                                ...card,
                                order: card.order + 1,
                            };
                        }

                        // move up the old cards on the old list under the current (old) card
                        if (card.list_id === current.list_id && card.order > currentCard.order) {
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
                    // Move to another list
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
                    }

                    // Move to another position in the same list
                    else {
                        const currentCards = cards.filter((card) => card.list_id === current.list_id);
                        const otherCards = cards.filter((card) => card.list_id !== current.list_id);

                        const currentCard = currentCards.find((card) => card.id === currentId);

                        if (!currentCard) return;

                        const newCards = arrayMove(currentCards, currentCard.order, targetCard.order).map((card, index) => {
                            return {
                                ...card,
                                order: index,
                            };
                        });

                        updatedCards = [...otherCards, ...newCards];
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
                const currentId = current.id;
                const targetId = target.id;

                if (targetId && currentId) {
                    const oldIndex = lists.findIndex((x) => x.id === currentId);
                    const newIndex = lists.findIndex((x) => x.id === targetId);

                    const newLists = arrayMove(lists, oldIndex, newIndex).map((list, index) => {
                        list.order = index;
                        return list;
                    });

                    setLists(newLists);
                }
            }
        },
        [lists]
    );

    const onCardAdded = useCallback((name: string, listId: string) => {
        const parsedName = name.trim();
    }, []);

    const onCardUpdated = useCallback((card: PageProps["cards"][0]) => {
        //
    }, []);

    return (
        <>
            <section className="flex max-h-full w-full max-w-full flex-1 justify-start gap-8 overflow-auto py-5 px-20">
                <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
                    <SortableContext items={lists.sort((a, b) => a.order - b.order).flatMap(({ id }) => id)} strategy={horizontalListSortingStrategy}>
                        {lists.map((list) => {
                            return <List key={list.id} {...list} cards={cards.filter((c) => c.list_id === list.id)} onCardAdded={onCardAdded} />;
                        })}
                    </SortableContext>

                    {draggedItem && (
                        <DragOverlay>
                            <Card {...draggedItem} isDragOverlay={true} isDragging={false} />
                        </DragOverlay>
                    )}
                </DndContext>
            </section>

            <CardPopup onUpdated={onCardUpdated} />
        </>
    );
}
