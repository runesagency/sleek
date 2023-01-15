import type { Card as CardType, List as ListType } from "@/lib/types";
import type { CSSProperties } from "react";

import { SortableType } from ".";

import Card from "@/components/Board/Layout/Kanban/Card";
import Button from "@/components/Forms/Button";
import Textarea from "@/components/Forms/Textarea";

import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { useClickOutside } from "@mantine/hooks";
import { IconDots, IconPlus } from "@tabler/icons";
import { useRef, useCallback, useState, memo } from "react";

export enum NewCardLocation {
    UP = "UP",
    DOWN = "DOWN",
}

const CardContainer = (props: CardType) => {
    const { id, order } = props;

    const { setNodeRef, listeners, isDragging, transform, transition } = useSortable({
        id,
        data: {
            id,
            order,
            type: SortableType.Card,
        },
    });

    const style: CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
    };

    return (
        <div {...listeners} ref={setNodeRef} style={style}>
            <Card {...props} isDragging={isDragging} />
        </div>
    );
};

type AddNewCardProps = {
    listId: string;
    onClose: () => void;
    onSave: (text: string) => void;
};

const AddNewCard = ({ listId, onClose, onSave }: AddNewCardProps) => {
    const ref = useClickOutside(() => onClose());
    const textarea = useRef<HTMLTextAreaElement>(null);

    const onButtonSaveClick = useCallback(() => {
        if (textarea.current) {
            onSave(textarea.current.value);
            onClose();
        }
    }, [onClose, onSave]);

    return (
        <div ref={ref} className="flex shrink-0 flex-col gap-2">
            <Textarea innerRef={textarea} autoFocus saveOnEnter saveToLocalStorage localStorageKey={listId + "-new-card"} onSave={onSave} onClose={onClose} />
            <Button.Large onClick={onButtonSaveClick}>Create New Card</Button.Large>
        </div>
    );
};

type ListProps = ListType & {
    cards: CardType[];
    onCardAdded: (name: string, listId: string, location: NewCardLocation) => void;
};

const List = ({ id, title, cards, onCardAdded, order }: ListProps) => {
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

    const addCardComponent = <AddNewCard listId={id} onClose={onNewCardClose} onSave={onNewCardAdded} />;

    const style: CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, 0, 0)` : undefined,
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
                <span className="rounded-full bg-dark-50 px-3 py-1 font-bold text-dark-900">{title}</span>

                <div className="flex items-center gap-3">
                    {!isAddingNewCard && <IconPlus height={20} className="duration-200 hover:opacity-75" onClick={() => onNewCardClick(NewCardLocation.UP)} />}

                    <IconDots height={20} className="duration-200 hover:opacity-75" />
                </div>
            </div>

            <div className={`flex h-full max-h-full flex-col gap-4 overflow-auto px-5 ${cards.length === 0 && !isAddingNewCard ? "py-0" : "py-5"}`}>
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

export default memo(List);
