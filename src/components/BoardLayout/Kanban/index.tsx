import type { PageProps } from "@/pages/projects/[id]";

import { NewCardLocation, List } from "@/components/BoardLayout/Kanban/List";
import { Card, CardPopup } from "@/components/BoardLayout/Kanban/Card";

import { StrictMode, useCallback, useState } from "react";
import { randomId } from "@mantine/hooks";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

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
    const [lists, setLists] = useState<PageProps["lists"]>(originalLists.sort((a, b) => a.order - b.order));
    const [cards, setCards] = useState<PageProps["cards"]>(originalCards.sort(cardSortAlgorithm(lists)));

    const onDragEnd = useCallback(
        (event: any) => {
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

                        // return arrayMove(lists, oldIndex, newIndex).map((list, index) => {
                        //     list.order = index;
                        //     return list;
                        // });
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

                        // cards = arrayMove(cards, currentCardIndex, targetCardIndex);
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
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="board" type="COLUMN" direction="horizontal">
                    {(provided) => (
                        <div ref={provided.innerRef} className="flex max-h-full w-full max-w-full flex-1 justify-start gap-8 overflow-auto py-5 px-20" {...provided.droppableProps}>
                            {lists.map((list, index) => {
                                return <List key={list.id} index={index} {...list} cards={cards.filter((c) => c.list_id === list.id)} onCardAdded={onCardAdded} />;
                            })}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <CardPopup onUpdated={onCardUpdated} />
        </>
    );
}
