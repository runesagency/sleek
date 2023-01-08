import type { LayoutProps, PageProps } from "@/pages/projects/[id]";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";

import { Card } from "@/components/Board/Layout/Kanban/Card";
import { NewCardLocation, List } from "@/components/Board/Layout/Kanban/List";
import { Large as ButtonLarge } from "@/components/Forms/Button";
import NoSSR from "@/components/NoSSR";

import ScrollContainer from "react-indiana-drag-scroll";
import { useCallback, useState } from "react";
import { randomId } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons";
import { horizontalListSortingStrategy, SortableContext, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, DragOverlay, DndContext } from "@dnd-kit/core";

export enum SortableType {
    List = "list",
    Card = "card",
}

export default function KanbanLayout({ lists, setLists, cards, setCards, boardId }: LayoutProps) {
    const [draggedItem, setDraggedItem] = useState<PageProps["cards"][0] | undefined | null>(null);

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
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
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
            } else {
                setDraggedItem(undefined);
            }
        },
        [cards]
    );

    const onDragOver = useCallback(
        (event: DragOverEvent) => {
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

                    let newDestinationListCards: PageProps["cards"] = [];

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
        (event: DragEndEvent) => {
            setDraggedItem(null);

            type Data = { type: SortableType; id: string; order: number };

            const current = event.active.data.current as Data;
            const target = event.over?.data.current as Data;

            if (!current || !target) return;

            // List to List
            if (current.type === SortableType.List && target.type === SortableType.List) {
                const newList = arrayMove(lists, current.order, target.order).map((list, index) => ({
                    ...list,
                    order: index,
                }));

                setLists(newList);
            }

            // Card to Card (same list)
            if (current.type === SortableType.Card && target.type === SortableType.Card) {
                const sourceListId = cards.find((card) => card.id === current.id)?.list_id;
                const destinationListId = cards.find((card) => card.id === target.id)?.list_id;

                if (!sourceListId || !destinationListId) return;

                if (sourceListId === destinationListId) {
                    const listCards = cards.filter((card) => card.list_id === sourceListId).sort((a, b) => a.order - b.order);
                    const newListCards = arrayMove(listCards, current.order, target.order).map((card, index) => ({
                        ...card,
                        order: index,
                    }));
                    setCards((cards) => [
                        ...cards.filter((card) => card.list_id !== sourceListId), //
                        ...newListCards,
                    ]);
                }
            }
        },
        [cards, lists, setCards, setLists]
    );

    const onCardAdded = useCallback(
        (name: string, listId: string, location: NewCardLocation) => {
            const parsedName = name.trim();
            if (parsedName === "") return;

            const list = lists.find((list) => list.id === listId);
            if (!list) return;

            const otherCards = cards.filter((card) => card.list_id !== listId);
            const listCards = cards.filter((card) => card.list_id === listId);

            const newCard = {
                id: randomId(),
                name: parsedName,
                list_id: listId,
                users: [],
                order: location === NewCardLocation.UP ? 0 : listCards.length,
            } as any;

            if (location === NewCardLocation.UP) {
                setCards([
                    ...otherCards, //
                    newCard,
                    ...listCards.map((card) => ({ ...card, order: card.order + 1 })),
                ]);
            } else {
                setCards([
                    ...otherCards, //
                    ...listCards,
                    newCard,
                ]);
            }
        },
        [cards, lists, setCards]
    );

    const onListAdded = useCallback(() => {
        const newLists = [
            ...lists,
            {
                id: randomId(),
                name: "My New List",
                order: lists.length,
                board_id: boardId,
                description: null,
            },
        ];

        setLists(newLists);
    }, [boardId, lists, setLists]);

    return (
        <NoSSR>
            <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
                <SortableContext items={lists.flatMap(({ id }) => id)} strategy={horizontalListSortingStrategy}>
                    <ScrollContainer className="flex h-full max-h-full w-full flex-1 justify-start gap-7 py-10 px-11" ignoreElements="*[data-prevent-drag-scroll]" hideScrollbars={false}>
                        {lists
                            .sort((a, b) => a.order - b.order)
                            .map((list) => {
                                return <List key={list.id} {...list} cards={cards.filter((card) => card.list_id === list.id)} onCardAdded={onCardAdded} />;
                            })}

                        <ButtonLarge className="h-max w-80 shrink-0 border border-dark-600 !bg-dark-700" icon={IconPlus} onClick={onListAdded}>
                            Create New List
                        </ButtonLarge>
                    </ScrollContainer>
                </SortableContext>

                {/* Only hide when anything beside the card is dragged (e.g. List) */}
                {(draggedItem === null || typeof draggedItem !== "undefined") && (
                    <DragOverlay>
                        {draggedItem && (
                            <Card {...(draggedItem as PageProps["cards"][0])} isDragging={false} /> //
                        )}
                    </DragOverlay>
                )}
            </DndContext>
        </NoSSR>
    );
}
