import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import type { PageProps } from "@/pages/projects/[id]";

import { NewCardLocation, List } from "@/components/BoardLayout/Kanban/List";
import { Card, CardPopup } from "@/components/BoardLayout/Kanban/Card";

import { MouseSensor, TouchSensor, useSensor, useSensors, DragOverlay, DndContext } from "@dnd-kit/core";
import { useCallback, useState } from "react";
import { arrayMove, horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { randomId } from "@mantine/hooks";

export enum SortableType {
    List = "list",
    Card = "card",
}

const cardSortAlgorithm = (lists: PageProps["lists"]) => (a: PageProps["cards"][0], b: PageProps["cards"][0]) => {
    const list1 = lists.filter((list) => list.id === a.list_id)[0];
    const list2 = lists.filter((list) => list.id === b.list_id)[0];

    // group by list_id using list
    // sort by list order and then by card order
    return list1.order - list2.order || a.order - b.order;
};

export default function KanbanLayout({ lists: originalLists, cards: originalCards }: PageProps) {
    const [draggedItem, setDraggedItem] = useState<PageProps["cards"][0] | null>(null);
    const [lists, setLists] = useState<PageProps["lists"]>(originalLists.sort((a, b) => a.order - b.order));
    const [cards, setCards] = useState<PageProps["cards"]>(originalCards.sort(cardSortAlgorithm(lists)));

    const sensors = useSensors(
        useSensor(MouseSensor, {
            // Require the mouse to move by 'x' pixels before activating
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(TouchSensor, {
            // Press delay of 250ms, with tolerance of 5px of movement
            activationConstraint: {
                delay: 250,
                tolerance: 5,
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
                setCards((cards) => {
                    const targetId: string = target.id;
                    const currentId: string = current.id;

                    const currentCardIndex = cards.findIndex((card) => card.id === currentId);
                    const currentCard = cards[currentCardIndex];
                    if (!currentCard) return cards;

                    // Card to List (Only if the list is empty)
                    if (target?.type === SortableType.List) {
                        const targetList = lists.find((list) => list.id === targetId);
                        if (!targetList) return cards;

                        const targetCards = cards.filter((card) => card.list_id === targetList.id);
                        if (targetCards.length !== 0) return cards;

                        return cards
                            .map((card) => {
                                // append on top of the list
                                if (card.id === currentId) {
                                    return {
                                        ...card,
                                        list_id: targetId,
                                        order: 0,
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
                            })
                            .sort(cardSortAlgorithm(lists));
                    }

                    // Card to Another Card (only if the card is not in the same list)
                    if (target?.type === SortableType.Card) {
                        const targetCardIndex = cards.findIndex((card) => card.id === targetId);
                        const targetCard = cards[targetCardIndex];

                        if (!targetCard) return cards;

                        // If the card is moving to another list, change the list_id
                        if (targetCard.list_id !== current.list_id) {
                            currentCard.list_id = targetCard.list_id;
                            return arrayMove(cards, currentCardIndex, targetCardIndex).sort(cardSortAlgorithm(lists));
                        }
                    }

                    return cards;
                });
            }
        },
        [lists]
    );

    const onDragEnd = useCallback(
        (event: DragEndEvent) => {
            setDraggedItem(null);

            const current = event.active.data.current;
            const target = event.over?.data.current;

            // List to Another List
            if (current?.type === SortableType.List && target?.type === SortableType.List) {
                setLists((lists) => {
                    const currentId = current.id;
                    const targetId = target.id;

                    if (targetId && currentId) {
                        const oldIndex = lists.findIndex((x) => x.id === currentId);
                        const newIndex = lists.findIndex((x) => x.id === targetId);

                        return arrayMove(lists, oldIndex, newIndex).map((list, index) => {
                            list.order = index;
                            return list;
                        });
                    }

                    return lists;
                });
            }

            // Card to Another Card
            if (current?.type === SortableType.Card && target?.type === SortableType.Card) {
                setCards((cards) => {
                    let sortIndex: Record<string, number> = {};

                    // card to card in the same list
                    if (target?.type === SortableType.Card) {
                        const currentId = current.id;
                        const targetId = target.id;

                        const currentCardIndex = cards.findIndex((card) => card.id === currentId);
                        const currentCard = cards[currentCardIndex];
                        if (!currentCard) return cards;

                        const targetCardIndex = cards.findIndex((card) => card.id === targetId);
                        const targetCard = cards[targetCardIndex];

                        if (!targetCard) return cards;

                        // If the card is moving to another list, change the list_id
                        if (targetCard.list_id !== current.list_id) return cards;

                        cards = arrayMove(cards, currentCardIndex, targetCardIndex);
                    }

                    return cards
                        .map((card) => {
                            if (typeof sortIndex[card.list_id] !== "undefined") {
                                sortIndex[card.list_id] += 1;
                            } else {
                                sortIndex[card.list_id] = 0;
                            }
                            card.order = sortIndex[card.list_id];
                            return card;
                        })
                        .sort(cardSortAlgorithm(lists));
                });
            }
        },
        [lists]
    );

    const onCardAdded = useCallback(
        (name: string, listId: string, location: NewCardLocation) => {
            const parsedName = name.trim();
            if (parsedName === "") return;

            const list = lists.find((list) => list.id === listId);
            if (!list) return;

            const listCards = cards.filter((card) => card.list_id === listId);
            const order = location === NewCardLocation.UP ? -1 : listCards.length;

            setCards((cards) =>
                [
                    ...cards,
                    {
                        id: randomId(),
                        name: parsedName,
                        list_id: listId,
                        users: [],
                        order,
                    } as any,
                ].sort(cardSortAlgorithm(lists))
            );
        },
        [cards, lists]
    );

    const onCardUpdated = useCallback((card: PageProps["cards"][0]) => {
        //
    }, []);

    return (
        <>
            <section className="flex max-h-full w-full max-w-full flex-1 justify-start gap-8 overflow-auto py-5 px-20">
                <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
                    <SortableContext items={lists.flatMap(({ id }) => id)} strategy={horizontalListSortingStrategy}>
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
