"use client";

import type { DragEvent } from "@/lib/drag-and-drop/use-drag-drop-context";

import { BoardLayoutContext } from "@/app/app/board/[id]/layout";
import List from "@/app/app/board/[id]/view/kanban/List";
import useDragDropContext from "@/lib/drag-and-drop/use-drag-drop-context";
import useDroppable, { SortableDirection } from "@/lib/drag-and-drop/use-droppable";
import { arrayMoveImmutable } from "@/lib/utils/array-move";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useMergedRef } from "@mantine/hooks";
import { useContext } from "react";

export enum SortableType {
    List = "list",
    Card = "card",
}

export default function KanbanLayoutPage() {
    const {
        data: { id, cards, lists },
        setCards,
        setLists,
    } = useContext(BoardLayoutContext);

    const { ref: dndContextRef, onDragEnd } = useDragDropContext();

    const { ref: droppableRef } = useDroppable({
        id: id,
        accepts: [SortableType.List],
        sortable: true,
        sortableDirection: SortableDirection.Horizontal,
    });

    const [autoAnimateRef] = useAutoAnimate<HTMLDivElement>({ duration: 100 });
    const dropAreaRef = useMergedRef(droppableRef, autoAnimateRef);

    onDragEnd(async ({ dragged, dropped }: DragEvent) => {
        // List to List
        if (dragged.type === SortableType.List && dropped.id === id) {
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
            if (currentCard.listId === dropped.id) {
                const cardsOnList = cards.filter((card) => card.listId === currentCard.listId).sort((a, b) => a.order - b.order);

                const newListCards = arrayMoveImmutable(cardsOnList, currentCard.order, dropped.index).map((card, index) => ({
                    ...card,
                    order: index,
                }));

                updatedCards = [
                    ...cards.filter((card) => card.listId !== currentCard.listId), //
                    ...newListCards,
                ];
            }

            // Card to Card (different list)
            else {
                const cardsOnOldList = cards
                    .filter((card) => card.listId === currentCard.listId)
                    .filter((card) => card.id !== currentCard.id)
                    .sort((a, b) => a.order - b.order)
                    .map((card, index) => ({ ...card, order: index }));

                let cardsOnNewList = cards //
                    .filter((card) => card.listId === dropped.id)
                    .sort((a, b) => a.order - b.order);

                if (dropped.index === 0) {
                    cardsOnNewList = [
                        {
                            ...currentCard,
                            listId: dropped.id,
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
                            listId: dropped.id,
                            order: dropped.index,
                        },
                        ...cardsAfter,
                    ];
                }

                updatedCards = [
                    ...cardsOnOldList, //
                    ...cardsOnNewList,
                    ...cards.filter((card) => card.listId !== dropped.id && card.listId !== currentCard.listId),
                ];
            }

            setCards(updatedCards);

            await fetch("/api/cards", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    updatedCards.filter((card) => {
                        const currentCard = cards.find((c) => c.id === card.id);
                        if (!currentCard) return false;

                        return currentCard.order !== card.order || currentCard.listId !== card.listId;
                    })
                ),
            });
        }
    });

    return (
        <section ref={dndContextRef} className="h-full w-full flex-1 overflow-auto">
            <div ref={dropAreaRef} className="flex h-full max-h-full w-full flex-1 justify-start gap-7 overflow-auto px-11 pb-10">
                {lists
                    .sort((a, b) => a.order - b.order)
                    .map((list) => {
                        return <List key={list.id} {...list} />;
                    })}
            </div>
        </section>
    );
}
