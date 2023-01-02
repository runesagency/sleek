import type { CSSProperties } from "react";
import type { PageProps } from "@/pages/projects/[id]";

import { SortableType } from ".";

import { CardContainer } from "@/components/BoardLayout/Kanban/Card";

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
    index: number;
    cards: PageProps["cards"];
    onCardAdded: (name: string, listId: string, location: NewCardLocation) => void;
};

export const List = ({ id, name, cards, onCardAdded, index }: ListProps) => {
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
        <Draggable draggableId={id} index={index}>
            {(provided) => (
                <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    className="group/container relative flex h-max max-h-full w-72 cursor-pointer flex-col gap-4 overflow-y-auto overflow-x-hidden rounded-md border border-dark-700 bg-dark-800 p-4 text-sm"
                >
                    <div className="flex w-full items-center justify-between gap-4 duration-200">
                        <span className="rounded-md bg-dark-700 px-3 py-1 font-semibold">{name}</span>

                        {/* <div className="flex items-center gap-2">
                            <IconPlus height={20} className="duration-200 hover:opacity-75" onClick={() => onNewCardClick(NewCardLocation.UP)} />
                            <IconDots height={20} className="duration-200 hover:opacity-75" />
                        </div> */}
                    </div>

                    {(cards.length > 0 || isAddingNewCard) && (
                        <div className="flex flex-col overflow-hidden">
                            <div className="hide-scrollbar flex max-h-full flex-col gap-4 overflow-hidden">
                                {isAddingNewCard === NewCardLocation.UP && addCardComponent}

                                <Droppable droppableId={id} type="task">
                                    {(droppableProvided, droppableSnapshot) => (
                                        <div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
                                            {cards.map((card) => {
                                                return <CardContainer key={card.id} {...card} />;
                                            })}
                                        </div>
                                    )}
                                </Droppable>

                                {isAddingNewCard === NewCardLocation.DOWN && addCardComponent}
                            </div>
                        </div>
                    )}

                    <button
                        className="flex items-center justify-center gap-2 rounded-md border border-dashed border-dark-500 p-2 text-center duration-200 hover:opacity-50"
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
