"use client";

import type { BoardList } from "@/app/app/board/[id]/layout";
import type { DragEvent } from "@/lib/drag-and-drop";

import { BoardLayoutContext } from "@/app/app/board/[id]/layout";
import List from "@/app/app/board/[id]/view/kanban/List";
import { DragDropContext, Droppable, SortableDirection } from "@/lib/drag-and-drop";
import { arrayMoveImmutable } from "@/lib/utils/array-move";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useMergedRef } from "@mantine/hooks";
import { useCallback, useContext } from "react";

export enum SortableType {
    List = "list",
    Card = "card",
}

type ListDropZoneProps = {
    innerRef: React.RefObject<HTMLDivElement>;
    lists: BoardList[];
};

const ListDropZone = ({ innerRef, lists }: ListDropZoneProps) => {
    const [autoAnimateRef] = useAutoAnimate<HTMLDivElement>({ duration: 100 });
    const ref = useMergedRef(innerRef, autoAnimateRef);

    return (
        <div ref={ref} className="flex h-full max-h-full w-full flex-1 justify-start gap-7 overflow-auto px-11 pb-10">
            {lists
                .sort((a, b) => a.order - b.order)
                .map((list) => {
                    return <List key={list.id} {...list} />;
                })}
        </div>
    );
};

export default function KanbanLayoutPage() {
    const {
        data: { id, cards, lists },
        setCards,
        setLists,
    } = useContext(BoardLayoutContext);

    const onDragEnd = useCallback(
        async ({ dragged, dropped }: DragEvent) => {
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

            // Card to Card
            if (dragged.type === SortableType.Card) {
                const currentCard = cards.find((card) => card.id === dragged.id);
                if (!currentCard) return;

                let updatedCards = cards;

                // Same List
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

                // Different List
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
        },
        [cards, id, lists, setCards, setLists]
    );

    return (
        <DragDropContext<HTMLDivElement> onDragEnd={onDragEnd}>
            {({ ref }) => (
                <section ref={ref} className="h-full w-full flex-1 overflow-auto">
                    <Droppable<HTMLDivElement> id={id} sortable sortableDirection={SortableDirection.Horizontal} accepts={[SortableType.List]}>
                        {({ ref }) => <ListDropZone innerRef={ref} lists={lists} />}
                    </Droppable>
                </section>
            )}
        </DragDropContext>
    );
}
