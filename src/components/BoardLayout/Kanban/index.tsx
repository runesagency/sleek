import type { PageProps } from "@/pages/projects/[id]";
import type { OnDragEndResponder } from "react-beautiful-dnd";

import { NewCardLocation, List } from "@/components/BoardLayout/Kanban/List";
import { CardPopup } from "@/components/BoardLayout/Kanban/Card";

import { StrictMode, useCallback, useState } from "react";
import { randomId } from "@mantine/hooks";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { arrayMoveImmutable } from "array-move";

export enum SortableType {
    List = "list",
    Card = "card",
}

export default function KanbanLayout({ lists: originalLists, cards: originalCards }: PageProps) {
    const [lists, setLists] = useState<PageProps["lists"]>(originalLists);
    const [cards, setCards] = useState<PageProps["cards"]>(originalCards);

    const onDragEnd: OnDragEndResponder = useCallback(
        (result) => {
            // dropped nowhere
            if (!result.destination) {
                return;
            }

            const type = result.type;
            const source = result.source;
            const destination = result.destination;

            // did not move anywhere - can bail early
            if (source.droppableId === destination.droppableId && source.index === destination.index) {
                return;
            }

            if (type === SortableType.List) {
                const newList = [...lists];
                const [removed] = newList.splice(source.index, 1);
                newList.splice(destination.index, 0, removed);

                setLists(newList);
            } else if (type === SortableType.Card) {
                const sourceListId = source.droppableId;
                const destinationListId = destination.droppableId;

                // same list
                if (sourceListId === destinationListId) {
                    // change the card order
                    const listCards = cards.filter((card) => card.list_id === sourceListId).sort((a, b) => a.order - b.order);
                    const newListCards = arrayMoveImmutable(listCards, source.index, destination.index).map((card, index) => ({
                        ...card,
                        order: index,
                    }));

                    setCards((cards) => [
                        ...cards.filter((card) => card.list_id !== sourceListId), //
                        ...newListCards,
                    ]);
                } else {
                    // different lists
                    const sourceListCards = cards.filter((card) => card.list_id === sourceListId).sort((a, b) => a.order - b.order);
                    const destinationListCards = cards.filter((card) => card.list_id === destinationListId).sort((a, b) => a.order - b.order);

                    const [removed] = sourceListCards.splice(source.index, 1);
                    destinationListCards.splice(destination.index, 0, removed);

                    const newSourceListCards = sourceListCards.map((card, index) => ({ ...card, order: index }));
                    const newDestinationListCards = destinationListCards.map((card, index) => ({
                        ...card,
                        order: index,
                        list_id: destinationListId,
                    }));

                    setCards((cards) => [
                        ...cards.filter((card) => card.list_id !== sourceListId && card.list_id !== destinationListId), //
                        ...newSourceListCards,
                        ...newDestinationListCards,
                    ]);
                }
            }
        },
        [cards, lists]
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
                <Droppable droppableId="board" type={SortableType.List} direction="horizontal">
                    {(provided) => (
                        <div ref={provided.innerRef} className="flex max-h-full w-full max-w-full flex-1 justify-start gap-7 overflow-auto py-10 px-14" {...provided.droppableProps}>
                            {lists.map((list, index) => {
                                return <List key={list.id} index={index} {...list} cards={cards.filter((card) => card.list_id === list.id)} onCardAdded={onCardAdded} />;
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
