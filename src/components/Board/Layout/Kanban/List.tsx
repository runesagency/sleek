import type { PageProps } from "@/pages/projects/[id]";

import { SortableType } from ".";

import { Card } from "@/components/Board/Layout/Kanban/Card";

import { useClickOutside, useLocalStorage } from "@mantine/hooks";
import { useCallback, useState } from "react";
import { IconDots, IconPlus } from "@tabler/icons";
import { Draggable, Droppable } from "react-beautiful-dnd";

export enum NewCardLocation {
    UP = "UP",
    DOWN = "DOWN",
}

type NewCardComponentProps = {
    listId: string;
    onClose: () => void;
    onSave: (text: string) => void;
};

const AddCardComponent = ({ listId, onClose, onSave: onAdded }: NewCardComponentProps) => {
    const ref = useClickOutside(() => onClose());
    const [value, setValue, removeValue] = useLocalStorage({
        key: listId + "-new-card",
    });

    const onSave = useCallback(() => {
        if (value) {
            onAdded(value);
        }

        onClose();
        removeValue();
    }, [onAdded, onClose, removeValue, value]);

    const onKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (event.key === "Enter" && event.shiftKey === false) {
                event.preventDefault();
                onSave();
            }

            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
            }
        },
        [onClose, onSave]
    );

    const onChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setValue(event.target.value);

            if (event.target.value === "") {
                removeValue();
            }
        },
        [removeValue, setValue]
    );

    return (
        <div ref={ref} className="flex flex-col gap-2">
            <textarea
                placeholder="Enter your card title here" //
                value={value}
                autoFocus
                onKeyDown={onKeyDown}
                onChange={onChange}
            />

            <button className="w-full rounded-md bg-dark-700 p-2 duration-200 hover:opacity-75" onClick={onSave}>
                Save
            </button>
        </div>
    );
};

type ListProps = PageProps["lists"][0] & {
    cards: PageProps["cards"];
    onCardAdded: (name: string, listId: string, location: NewCardLocation) => void;
};

export const List = ({ id, name, cards, onCardAdded, order }: ListProps) => {
    const [isAddingNewCard, setIsAddingNewCard] = useState<NewCardLocation.UP | NewCardLocation.DOWN | false>(false);

    const onNewCardClick = (location: NewCardLocation) => {
        setIsAddingNewCard(location);
    };

    const onNewCardClose = useCallback(() => {
        setIsAddingNewCard(false);
    }, []);

    const onNewCardAdded = useCallback(
        (name: string) => {
            if (!isAddingNewCard) return;
            onCardAdded(name, id, isAddingNewCard);
        },
        [id, isAddingNewCard, onCardAdded]
    );

    const addCardComponent = <AddCardComponent listId={id} onClose={onNewCardClose} onSave={onNewCardAdded} />;

    return (
        <Draggable draggableId={id} index={order}>
            {(provided) => (
                <div
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                    className="group/container relative mx-3.5 flex h-max max-h-full w-full max-w-sm flex-col overflow-auto rounded-lg border border-dark-600 bg-dark-800 text-sm"
                >
                    <div {...provided.dragHandleProps} className="flex w-full items-center justify-between gap-4 bg-dark-900 px-7 py-4 duration-200">
                        <span className="rounded-full bg-dark-50 px-3 py-1 font-bold text-dark-900">{name}</span>

                        <div className="flex items-center gap-3">
                            <IconPlus height={20} className="duration-200 hover:opacity-75" onClick={() => onNewCardClick(NewCardLocation.UP)} />
                            <IconDots height={20} className="duration-200 hover:opacity-75" />
                        </div>
                    </div>

                    <Droppable droppableId={id} type={SortableType.Card}>
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`
                                    hide-scrollbar flex h-full max-h-full flex-col gap-4 overflow-y-auto overflow-x-hidden px-5 duration-200
                                    ${cards.length > 0 || isAddingNewCard ? "py-3" : "bg-dark-900 py-1"}
                                `}
                            >
                                {isAddingNewCard === NewCardLocation.UP && addCardComponent}

                                <div className="flex max-h-full flex-col">
                                    {cards
                                        .sort((a, b) => a.order - b.order)
                                        .map((card) => {
                                            return <Card key={card.id} {...card} />;
                                        })}

                                    {provided.placeholder}
                                </div>

                                {isAddingNewCard === NewCardLocation.DOWN && addCardComponent}
                            </div>
                        )}
                    </Droppable>

                    <button
                        className="flex items-center justify-center gap-2 border border-dark-600 bg-dark-700 p-2 text-center duration-200 hover:opacity-75"
                        onClick={() => onNewCardClick(NewCardLocation.DOWN)}
                    >
                        <IconPlus height={15} />
                        <p>Add Card</p>
                    </button>
                </div>
            )}
        </Draggable>
    );
};
