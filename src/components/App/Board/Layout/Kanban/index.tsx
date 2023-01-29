import type { Card as CardType } from "@/lib/types";
import type { LayoutProps } from "@/pages/app/boards/[id]";

import List, { NewCardLocation } from "@/components/App/Board/Layout/Kanban/List";
import Button from "@/components/Forms/Button";
import useDroppable, { SortableDirection } from "@/lib/hooks/drag-and-drop/use-droppable";
import { arrayMoveImmutable } from "@/lib/utils/array-move";

import { IconPlus } from "@tabler/icons";
import { memo, useCallback, useState } from "react";

export enum SortableType {
    List = "list",
    Card = "card",
}

const KanbanLayout = ({ lists, setLists, cards, setCards, boardId }: LayoutProps) => {
    const [draggedItem, setDraggedItem] = useState<CardType | undefined | null>(null);

    const { ref } = useDroppable({
        accepts: [SortableType.List],
        sortable: true,
        sortableDirection: SortableDirection.Horizontal,
    });

    const onDragStart = useCallback(
        (event: any) => {
            const current = event.active.data.current;

            if (current?.type === SortableType.Card) {
                const activeCard = cards.find((card) => card.id === event.active.id);

                if (activeCard) {
                    setDraggedItem(activeCard);
                }
            } else {
                setDraggedItem(undefined);
            }
        },
        [cards]
    );

    const onDragOver = useCallback(
        (event: any) => {
            type Data = { type: SortableType; id: string; order: number };

            const current = event.active.data.current as Data;
            const target = event.over?.data.current as Data;

            if (!current || !target) return;

            // Card to Card (different list) or Card to List
            if (current.type === SortableType.Card && (target.type === SortableType.Card || target.type === SortableType.List)) {
                const sourceListId = cards.find((card) => card.id === current.id)?.list_id;
                const destinationListId = target.type === SortableType.List ? target.id : cards.find((card) => card.id === target.id)?.list_id;

                if (!sourceListId || !destinationListId) return;

                if (sourceListId !== destinationListId) {
                    const currentCard = cards.find((card) => card.id === current.id);
                    if (!currentCard) return;

                    const sourceListCards = cards.filter((card) => card.list_id === sourceListId).sort((a, b) => a.order - b.order);
                    const destinationListCards = cards.filter((card) => card.list_id === destinationListId).sort((a, b) => a.order - b.order);

                    // Card to List only works if the list is empty
                    if (target.type === SortableType.List && destinationListCards.length !== 0) return;

                    const newSourceListCards = sourceListCards
                        .filter((card) => card.id !== current.id)
                        .map((card, index) => ({
                            ...card,
                            order: index,
                        }));

                    let newDestinationListCards: CardType[] = [];

                    if (target.type === SortableType.List) {
                        newDestinationListCards = [
                            {
                                ...currentCard,
                                list_id: destinationListId,
                                order: destinationListCards.length,
                            },
                            ...destinationListCards,
                        ];
                    } else {
                        newDestinationListCards = [
                            ...destinationListCards.slice(0, target.order), //
                            {
                                ...currentCard,
                                list_id: destinationListId,
                                order: target.order,
                            },
                            ...destinationListCards.slice(target.order),
                        ];
                    }

                    newDestinationListCards = newDestinationListCards.map((card, index) => ({
                        ...card,
                        order: index,
                    }));

                    setCards((cards) => [
                        ...cards.filter((card) => card.list_id !== sourceListId && card.list_id !== destinationListId), //
                        ...newSourceListCards,
                        ...newDestinationListCards,
                    ]);
                }
            }
        },
        [cards, setCards]
    );

    const onDragEnd = useCallback(
        async (event: any) => {
            setDraggedItem(null);

            type Data = { type: SortableType; id: string; order: number };

            const current = event.active.data.current as Data;
            const target = event.over?.data.current as Data;

            if (!current || !target) return;

            // List to List
            if (current.type === SortableType.List && target.type === SortableType.List) {
                const newList = arrayMoveImmutable(lists, current.order, target.order).map((list, index) => ({
                    ...list,
                    order: index,
                }));

                setLists(newList);
            }

            if (current.type === SortableType.Card) {
                let updatedCards = cards;

                // Card to Card (same list)
                if (target.type === SortableType.Card) {
                    const sourceListId = cards.find((card) => card.id === current.id)?.list_id;
                    const destinationListId = cards.find((card) => card.id === target.id)?.list_id;

                    if (!sourceListId || !destinationListId) return;

                    if (sourceListId === destinationListId) {
                        const listCards = cards.filter((card) => card.list_id === sourceListId).sort((a, b) => a.order - b.order);
                        const newListCards = arrayMoveImmutable(listCards, current.order, target.order).map((card, index) => ({
                            ...card,
                            order: index,
                        }));

                        updatedCards = [
                            ...cards.filter((card) => card.list_id !== sourceListId), //
                            ...newListCards,
                        ];

                        setCards(updatedCards);
                    }
                }

                await fetch("/api/cards", {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(
                        updatedCards.filter((card) => {
                            const currentCard = cards.find((c) => c.id === card.id);
                            if (!currentCard) return false;

                            return currentCard.order !== card.order || currentCard.list_id !== card.list_id;
                        })
                    ),
                });
            }
        },
        [cards, lists, setCards, setLists]
    );

    const onCardAdded = useCallback(
        async (name: string, listId: string, location: NewCardLocation) => {
            const parsedName = name.trim();
            if (parsedName === "") return;

            const list = lists.find((list) => list.id === listId);
            if (!list) return;

            const otherCards = cards.filter((card) => card.list_id !== listId);
            const listCards = cards.filter((card) => card.list_id === listId);

            const newCard: Partial<CardType> = {
                title: parsedName,
                list_id: listId,
                board_id: list.board_id,
                order: location === NewCardLocation.UP ? 0 : listCards.length,
            };

            const res = await fetch("/api/cards", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newCard),
            });

            const card: CardType = await res.json();

            let updatedCards: CardType[] = [];

            if (location === NewCardLocation.UP) {
                updatedCards = [
                    ...otherCards, //
                    card,
                    ...listCards.map((card) => ({ ...card, order: card.order + 1 })),
                ];
            } else {
                updatedCards = [
                    ...otherCards, //
                    ...listCards,
                    card,
                ];
            }

            setCards(updatedCards);

            await fetch("/api/cards", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedCards),
            });
        },
        [cards, lists, setCards]
    );

    const onListAdded = useCallback(() => {
        const newLists = [...lists];

        setLists(newLists);
    }, [lists, setLists]);

    return (
        <div className="h-full w-full">
            <div ref={ref} className="flex h-full w-full flex-1 justify-start gap-7 overflow-auto py-10 px-11">
                {lists
                    .sort((a, b) => a.order - b.order)
                    .map((list) => {
                        return <List key={list.id} {...list} cards={cards.filter((card) => card.list_id === list.id)} onCardAdded={onCardAdded} />;
                    })}

                <Button.Large className="h-max w-80 shrink-0 border border-dark-600 !bg-dark-700" icon={IconPlus} onClick={onListAdded}>
                    Create New List
                </Button.Large>
            </div>
        </div>
    );
};

export default memo(KanbanLayout);
