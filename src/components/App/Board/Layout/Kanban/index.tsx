import type { DragEvent } from "@/lib/hooks/drag-and-drop/use-drag-drop-context";
import type { Card as CardType } from "@/lib/types";
import type { LayoutProps } from "@/pages/app/boards/[id]";

import List, { NewCardLocation } from "@/components/App/Board/Layout/Kanban/List";
import Button from "@/components/Forms/Button";
import useDragDropContext from "@/lib/hooks/drag-and-drop/use-drag-drop-context";
import useDroppable, { SortableDirection } from "@/lib/hooks/drag-and-drop/use-droppable";
import { arrayMoveImmutable } from "@/lib/utils/array-move";

import { IconPlus } from "@tabler/icons";
import { memo, useCallback } from "react";

export enum SortableType {
    List = "list",
    Card = "card",
}

const KanbanLayout = ({ lists, setLists, cards, setCards, boardId }: LayoutProps) => {
    const { ref: dndContextRef, onDragEnd } = useDragDropContext();

    const { ref: droppableRef } = useDroppable({
        id: boardId,
        accepts: [SortableType.List],
        sortable: true,
        sortableDirection: SortableDirection.Horizontal,
    });

    onDragEnd(async ({ dragged, dropped }: DragEvent) => {
        // List to List
        if (dragged.type === SortableType.List && dropped.id === boardId) {
            const list = lists.find((list) => list.id === dragged.id);
            if (!list) return;

            const newList = arrayMoveImmutable(lists, list.order, dropped.index).map((list, index) => ({
                ...list,
                order: index,
            }));

            setLists(newList);
        }

        if (dragged.type === SortableType.Card) {
            const currentCard = cards.find((card) => card.id === dragged.id);
            if (!currentCard) return;

            let updatedCards = cards;

            // Card to Card (same list)
            if (currentCard.list_id === dropped.id) {
                const cardsOnList = cards.filter((card) => card.list_id === currentCard.list_id).sort((a, b) => a.order - b.order);

                const newListCards = arrayMoveImmutable(cardsOnList, currentCard.order, dropped.index).map((card, index) => ({
                    ...card,
                    order: index,
                }));

                updatedCards = [
                    ...cards.filter((card) => card.list_id !== currentCard.list_id), //
                    ...newListCards,
                ];

                setCards(updatedCards);
            }

            // Card to Card (different list)
            else {
                const cardsOnOldList = cards
                    .filter((card) => card.list_id === currentCard.list_id)
                    .filter((card) => card.id !== currentCard.id)
                    .sort((a, b) => a.order - b.order)
                    .map((card, index) => ({ ...card, order: index }));

                let cardsOnNewList = cards //
                    .filter((card) => card.list_id === dropped.id)
                    .sort((a, b) => a.order - b.order);

                if (dropped.index === 0) {
                    cardsOnNewList = [
                        {
                            ...currentCard,
                            list_id: dropped.id,
                            order: 0,
                        },
                        ...cardsOnNewList.map((card) => ({
                            ...card,
                            order: card.order + 1,
                        })),
                    ];
                } else {
                    const cardsBefore = cardsOnNewList.slice(0, dropped.index);

                    const cardsAfter = cardsOnNewList.slice(dropped.index).map((card) => ({
                        ...card,
                        order: card.order + 1,
                    }));

                    cardsOnNewList = [
                        ...cardsBefore, //
                        {
                            ...currentCard,
                            list_id: dropped.id,
                            order: dropped.index,
                        },
                        ...cardsAfter,
                    ];
                }

                updatedCards = [
                    ...cardsOnOldList, //
                    ...cardsOnNewList,
                    ...cards.filter((card) => card.list_id !== dropped.id && card.list_id !== currentCard.list_id),
                ];

                setCards(updatedCards);
            }

            // await fetch("/api/cards", {
            //     method: "PATCH",
            //     headers: {
            //         "Content-Type": "application/json",
            //     },
            //     body: JSON.stringify(
            //         updatedCards.filter((card) => {
            //             const currentCard = cards.find((c) => c.id === card.id);
            //             if (!currentCard) return false;

            //             return currentCard.order !== card.order || currentCard.list_id !== card.list_id;
            //         })
            //     ),
            // });
        }
    });

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
        <section ref={dndContextRef} className="h-full w-full">
            <div ref={droppableRef} className="flex h-full w-full flex-1 justify-start gap-7 overflow-auto py-10 px-11">
                {lists
                    .sort((a, b) => a.order - b.order)
                    .map((list) => {
                        return <List key={list.id} {...list} cards={cards.filter((card) => card.list_id === list.id)} onCardAdded={onCardAdded} />;
                    })}

                <Button.Large className="h-max w-80 shrink-0 border border-dark-600 !bg-dark-700" icon={IconPlus} onClick={onListAdded}>
                    Create New List
                </Button.Large>
            </div>
        </section>
    );
};

export default memo(KanbanLayout);
