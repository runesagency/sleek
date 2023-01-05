import type { PageProps } from "@/pages/projects/[id]";
import type { CSSProperties } from "react";

import { SortableType } from ".";

import { CardContainer } from "@/components/Board/Layout/Kanban/Card";
import { Large } from "@/components/Forms/Button";

import { useClickOutside, useLocalStorage } from "@mantine/hooks";
import { useCallback, useState } from "react";
import { IconDots, IconPlus } from "@tabler/icons";
import { SortableContext, useSortable } from "@dnd-kit/sortable";

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
        <div ref={ref} className="flex shrink-0 flex-col gap-2">
            <textarea
                className="rounded-lg bg-dark-500 p-5 focus:outline-none"
                placeholder="Enter your card title here" //
                value={value}
                autoFocus
                rows={3}
                onKeyDown={onKeyDown}
                onChange={onChange}
            />

            <Large onClick={onSave}>Create New Card</Large>
        </div>
    );
};

type ListProps = PageProps["lists"][0] & {
    cards: PageProps["cards"];
    onCardAdded: (name: string, listId: string, location: NewCardLocation) => void;
};

export const List = ({ id, name, cards, onCardAdded, order }: ListProps) => {
    const [isAddingNewCard, setIsAddingNewCard] = useState<NewCardLocation.UP | NewCardLocation.DOWN | false>(false);
    const { setNodeRef, listeners, transform, transition, attributes, isDragging } = useSortable({
        id,
        data: {
            id,
            order,
            type: SortableType.List,
        },
    });

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

    const style: CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            data-prevent-drag-scroll
            className="group/container relative flex h-max max-h-full w-full max-w-sm shrink-0 flex-col overflow-hidden rounded-lg border border-dark-600 bg-dark-800 text-sm"
        >
            <div {...listeners} {...attributes} className={`flex w-full items-center justify-between gap-4 px-7 py-4 duration-200 hover:bg-dark-600 ${isDragging ? "bg-dark-600" : "bg-dark-900"}`}>
                <span className="rounded-full bg-dark-50 px-3 py-1 font-bold text-dark-900">{name}</span>

                <div className="flex items-center gap-3">
                    {!isAddingNewCard && <IconPlus height={20} className="duration-200 hover:opacity-75" onClick={() => onNewCardClick(NewCardLocation.UP)} />}

                    <IconDots height={20} className="duration-200 hover:opacity-75" />
                </div>
            </div>

            <div className={`flex h-full max-h-full flex-col gap-4 overflow-auto px-5 ${cards.length === 0 && !isAddingNewCard ? "py-0" : "py-3"}`}>
                {isAddingNewCard === NewCardLocation.UP && addCardComponent}

                <SortableContext items={cards.flatMap(({ id }) => id)}>
                    {cards.map((card) => {
                        return <CardContainer key={card.id} {...card} />;
                    })}
                </SortableContext>

                {isAddingNewCard === NewCardLocation.DOWN && addCardComponent}
            </div>

            {!isAddingNewCard && (
                <button
                    className="flex items-center justify-center gap-2 border border-dark-600 bg-dark-700 p-2 text-center text-base duration-200 hover:opacity-75"
                    onClick={() => onNewCardClick(NewCardLocation.DOWN)}
                >
                    <IconPlus height={15} />
                    <p>Add Card</p>
                </button>
            )}
        </div>
    );
};
