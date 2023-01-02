import type { PageProps } from "@/pages/projects/[id]";
import type { OnDragEndResponder } from "react-beautiful-dnd";

import { NewCardLocation, List } from "@/components/Board/Layout/Kanban/List";

import { useCallback, useState } from "react";
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
                setLists((lists) =>
                    arrayMoveImmutable(lists, source.index, destination.index).map((list, index) => ({
                        ...list,
                        order: index,
                    }))
                );
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
        [cards]
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
        [cards, lists]
    );

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="board" type={SortableType.List} direction="horizontal">
                {(provided) => (
                    <div ref={provided.innerRef} className="flex h-full max-h-full w-full max-w-full flex-1 justify-start overflow-auto py-10 px-11" {...provided.droppableProps}>
                        {lists
                            .sort((a, b) => a.order - b.order)
                            .map((list) => {
                                return <List key={list.id} {...list} cards={cards.filter((card) => card.list_id === list.id)} onCardAdded={onCardAdded} />;
                            })}

                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
}
