import type { CardProps } from "@/components/App/Board/Layout/Kanban/Card";
import type { List as ListType } from "@prisma/client";

import { SortableType } from ".";

import Card from "@/components/App/Board/Layout/Kanban/Card";
import { Button, Textarea } from "@/components/Forms";
import useDraggable from "@/lib/drag-and-drop/use-draggable";
import useDroppable, { SortableDirection } from "@/lib/drag-and-drop/use-droppable";

import autoAnimate, { getTransitionSizes } from "@formkit/auto-animate";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useClickOutside, useMergedRef } from "@mantine/hooks";
import { IconDots, IconPlus } from "@tabler/icons";
import clsx from "clsx";
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
    cards: Omit<CardProps, "setIsDragging">[];
    onCardAdded: (name: string, listId: string, location: NewCardLocation) => void;
};

const List = ({ id, title, cards, onCardAdded }: ListProps) => {
    const [isAddingNewCard, setIsAddingNewCard] = useState<NewCardLocation.UP | NewCardLocation.DOWN | false>(false);
    const [isAnyCardDragging, setIsAnyCardDragging] = useState(false);
    const [isOnView, setIsOnView] = useState(false);
    const [isOnHover, setIsOnHover] = useState(false);

    const {
        ref: draggableRef,
        handleRef,
        isDragging,
    } = useDraggable<HTMLDivElement>({
        id,
        type: SortableType.List,
    });

    const {
        ref: droppableRef,
        onDragEnter,
        onDragLeave,
    } = useDroppable({
        id,
        accepts: [SortableType.Card],
        sortable: true,
        sortableDirection: SortableDirection.Vertical,
    });

    const [autoAnimateRef] = useAutoAnimate<HTMLDivElement>();
    const dropAreaRef = useMergedRef(droppableRef, autoAnimateRef);

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

    onDragEnter(() => {
        setIsOnHover(true);
    });

    onDragLeave(() => {
        setIsOnHover(false);
    });

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

    if (droppableRef.current) {
        autoAnimate(droppableRef.current, (element, action, oldCoords, newCoords) => {
            let keyframes: Keyframe[] = [];

            if (action === "remain" && oldCoords && newCoords) {
                // for items that remain, calculate the delta
                // from their old position to their new position
                const deltaY = oldCoords.top - newCoords.top;

                // use the getTransitionSizes() helper function to
                // get the old and new widths of the elements
                const [widthFrom, widthTo, heightFrom, heightTo] = getTransitionSizes(element, oldCoords, newCoords);

                // set up our steps with our positioning keyframes
                const start: Keyframe = { transform: `translateY(${deltaY}px)` };
                const mid: Keyframe = { transform: `translateY(0)` };
                const end: Keyframe = { transform: `translateY(0)` };

                // if the dimensions changed, animate them too.
                if (widthFrom !== widthTo) {
                    start.width = `${widthFrom}px`;
                    mid.width = `${widthFrom >= widthTo ? widthTo / 1.05 : widthTo * 1.05}px`;
                    end.width = `${widthTo}px`;
                }
                if (heightFrom !== heightTo) {
                    start.height = `${heightFrom}px`;
                    mid.height = `${heightFrom >= heightTo ? heightTo / 1.05 : heightTo * 1.05}px`;
                    end.height = `${heightTo}px`;
                }

                keyframes = [start, mid, end];
            }

            // return our KeyframeEffect() and pass
            // it the chosen keyframes.
            return new KeyframeEffect(element, keyframes, {
                duration: 200,
            });
        });
    }

    return (
        <div
            ref={draggableRef}
            className="group/list relative flex h-max max-h-full w-full max-w-sm shrink-0 flex-col overflow-hidden rounded-lg border border-dark-600 bg-dark-800 font-manrope text-sm text-dark-50"
        >
            <div ref={handleRef} className={clsx("flex w-full items-center justify-between gap-4 px-7 py-4 duration-200 hover:bg-dark-600", isDragging ? "bg-dark-600" : "bg-dark-900")}>
                <span className="rounded-full bg-dark-50 px-3 py-1 font-bold text-dark-900">{title}</span>

                <div className="flex items-center gap-3">
                    {!isAddingNewCard && <IconPlus height={20} className="duration-200 hover:opacity-75" onClick={() => onNewCardClick(NewCardLocation.UP)} />}

                    <IconDots height={20} className="duration-200 hover:opacity-75" />
                </div>
            </div>

            <div
                ref={dropAreaRef}
                className={clsx(
                    "flex h-full max-h-full flex-col gap-4 overflow-y-auto overflow-x-hidden px-5 delay-200 duration-500 will-change-auto",
                    cards.length === 0 && !isAddingNewCard && !isAnyCardDragging && !isOnHover ? "py-0" : "py-5"
                )}
            >
                {isAddingNewCard === NewCardLocation.UP && addCardComponent}

                {(isOnView || isAnyCardDragging || isDragging) &&
                    cards.map((card) => {
                        return <Card key={card.id} {...card} setIsDragging={setIsAnyCardDragging} />;
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
