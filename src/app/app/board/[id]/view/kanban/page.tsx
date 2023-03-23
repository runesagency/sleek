"use client";

import type { BoardList } from "@/app/app/board/[id]/BoardLayoutContext";
import type { DragEvent } from "@/lib/drag-and-drop";
import type { ApiMethod, ApiResult } from "@/lib/types";

import { BoardLayoutContext } from "@/app/app/board/[id]/BoardLayoutContext";
import List from "@/app/app/board/[id]/view/kanban/List";
import { ApiRoutes } from "@/lib/constants";
import { DragDropProvider, Droppable, SortableDirection } from "@/lib/drag-and-drop";
import { arrayMoveImmutable } from "@/lib/utils/array-move";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useMergedRef } from "@mantine/hooks";
import clsx from "clsx";
import { useCallback, useContext, useRef, useState } from "react";
import { toast } from "react-toastify";

export enum SortableType {
    List = "list",
    Card = "card",
}

type ListDropZoneProps = {
    innerRef: React.RefObject<HTMLDivElement>;
    lists: BoardList[];
};

const ListDropZone = ({ innerRef, lists }: ListDropZoneProps) => {
    const [isGrabbing, setIsGrabbing] = useState(false);

    const [autoAnimateRef] = useAutoAnimate<HTMLDivElement>({ duration: 100 });
    const ref = useMergedRef(innerRef, autoAnimateRef);

    const position = useRef({ top: 0, left: 0, x: 0, y: 0 });

    const onMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (e.button !== 0) return;
            if (e.target !== e.currentTarget) return;

            const container = innerRef.current;
            if (!container) return;

            setIsGrabbing(true);

            position.current = {
                // The current scroll
                left: container.scrollLeft,
                top: container.scrollTop,

                // Get the current mouse position
                x: e.clientX,
                y: e.clientY,
            };
        },
        [innerRef]
    );

    const onMouseUp = useCallback(() => {
        setIsGrabbing(false);
    }, []);

    const onMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (!isGrabbing) return;

            const container = innerRef.current;
            if (!container) return;

            const pos = position.current;

            // How far the mouse has been moved
            const dx = e.clientX - pos.x;
            const dy = e.clientY - pos.y;

            // Scroll the element
            container.scrollTop = pos.top - dy;
            container.scrollLeft = pos.left - dx;
        },
        [innerRef, isGrabbing]
    );

    return (
        <div
            ref={ref}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            className={clsx("flex h-full max-h-full w-full flex-1 justify-start gap-7 overflow-auto px-11 pb-10", isGrabbing ? "cursor-grabbing select-none" : "cursor-grab select-auto")}
        >
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
        refreshData,
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

                const listUpdateBody: ApiMethod.ListCollections.PatchSchemaType = {
                    boardId: id,
                    lists: newList.map((list) => ({ id: list.id, order: list.order })),
                };

                const res = await fetch(ApiRoutes.ListCollections, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(listUpdateBody),
                });

                const { error }: ApiResult<ApiMethod.ListCollections.PatchResult> = await res.json();

                if (error) {
                    toast.error(error.message);
                    refreshData();
                }
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

                const cardUpdateBody: ApiMethod.CardCollections.PatchSchemaType = {
                    boardId: id,
                    cards: updatedCards.filter((card) => {
                        const currentCard = cards.find((c) => c.id === card.id);
                        if (!currentCard) return false;

                        return currentCard.order !== card.order || currentCard.listId !== card.listId;
                    }),
                };

                const res = await fetch(ApiRoutes.CardCollections, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(cardUpdateBody),
                });

                const { error }: ApiResult<ApiMethod.CardCollections.PatchResult> = await res.json();

                if (error) {
                    toast.error(error.message);
                    refreshData();
                }
            }
        },
        [cards, id, lists, setCards, refreshData, setLists]
    );

    return (
        <DragDropProvider onDragEnd={onDragEnd}>
            <section className="h-full w-full flex-1 overflow-auto">
                <Droppable<HTMLDivElement> id={id} sortable sortableDirection={SortableDirection.Horizontal} accepts={[SortableType.List]}>
                    {({ ref }) => <ListDropZone innerRef={ref} lists={lists} />}
                </Droppable>
            </section>
        </DragDropProvider>
    );
}
