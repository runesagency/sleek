import type { Card as CardType, List as ListType } from "@/lib/types";

import { SortableType } from ".";

import Card from "@/components/App/Board/Layout/Kanban/Card";
import Button from "@/components/Forms/Button";
import Textarea from "@/components/Forms/Textarea";
import useDraggable from "@/lib/hooks/drag-and-drop/use-draggable";
import useDroppable, { SortableDirection } from "@/lib/hooks/drag-and-drop/use-droppable";

import { useClickOutside } from "@mantine/hooks";
import { IconDots, IconPlus } from "@tabler/icons";
import { useEffect, useRef, useCallback, useState, memo } from "react";

export enum NewCardLocation {
    UP = "UP",
    DOWN = "DOWN",
}

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

const List = ({ id, title, cards, onCardAdded }: ListProps) => {
    const [isAddingNewCard, setIsAddingNewCard] = useState<NewCardLocation.UP | NewCardLocation.DOWN | false>(false);
    const [isAnyCardDragging, setIsAnyCardDragging] = useState(false);
    const [isOnView, setIsOnView] = useState(true);

    const {
        ref: draggableRef,
        handleRef,
        isDragging,
    } = useDraggable<HTMLDivElement>({
        type: SortableType.List,
    });

    const { ref: droppableRef } = useDroppable({
        accepts: [SortableType.Card],
        sortable: true,
        sortableDirection: SortableDirection.Vertical,
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

    useEffect(() => {
        const current = draggableRef.current;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                setIsOnView(entry.isIntersecting);
            });
        });

        if (current) {
            observer.observe(current);
        }

        return () => {
            if (current) {
                observer.unobserve(current);
            }
        };
    }, [draggableRef]);

    return (
        <div
            ref={draggableRef}
            className="group/list relative flex h-max max-h-full w-full max-w-sm shrink-0 flex-col overflow-hidden rounded-lg border border-dark-600 bg-dark-800 font-manrope text-sm text-white"
        >
            <div ref={handleRef} className={`flex w-full items-center justify-between gap-4 px-7 py-4 duration-200 hover:bg-dark-600 ${isDragging ? "bg-dark-600" : "bg-dark-900"}`}>
                <span className="rounded-full bg-dark-50 px-3 py-1 font-bold text-dark-900">{title}</span>

                <div className="flex items-center gap-3">
                    {!isAddingNewCard && <IconPlus height={20} className="duration-200 hover:opacity-75" onClick={() => onNewCardClick(NewCardLocation.UP)} />}

                    <IconDots height={20} className="duration-200 hover:opacity-75" />
                </div>
            </div>

            <div
                ref={droppableRef}
                className={`
                    flex h-full max-h-full flex-col gap-4 overflow-auto px-5 will-change-scroll 
                    ${cards.length === 0 && !isAddingNewCard && !isAnyCardDragging ? "py-0" : "py-5"}
                `}
            >
                {isAddingNewCard === NewCardLocation.UP && addCardComponent}

                {(isOnView || isAnyCardDragging || isDragging) &&
                    cards.map((card) => {
                        return <Card key={card.id} {...card} isDragging={false} setIsDragging={setIsAnyCardDragging} />;
                    })}

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
