import type { BoardList } from "@/app/app/board/[id]/layout";

import { BoardLayoutContext } from "@/app/app/board/[id]/layout";
import Card from "@/app/app/board/[id]/view/kanban/Card";
import { SortableType } from "@/app/app/board/[id]/view/kanban/page";
import { Button, Textarea } from "@/components/Forms";
import { Draggable, Droppable, SortableDirection } from "@/lib/drag-and-drop";

import autoAnimate, { getTransitionSizes } from "@formkit/auto-animate";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useClickOutside, useMergedRef } from "@mantine/hooks";
import { IconDots, IconPlus } from "@tabler/icons";
import clsx from "clsx";
import { useRef, useCallback, useState, memo, useContext } from "react";

enum NewCardLocation {
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

type CardDropZoneProps = {
    innerRef: React.Ref<HTMLDivElement>;
    isAddingNewCard: NewCardLocation | false;
    setIsAddingNewCard: (value: NewCardLocation | false) => void;
    listId: string;
    isOnHover: boolean;
};

const CardDropZone = ({ innerRef, isAddingNewCard, setIsAddingNewCard, listId, isOnHover }: CardDropZoneProps) => {
    const {
        data: { cards: allCards },
        onCreateNewCard,
    } = useContext(BoardLayoutContext);

    const elementRef = useRef<HTMLDivElement>(null);
    const [autoAnimateRef] = useAutoAnimate<HTMLDivElement>();

    const ref = useMergedRef(innerRef, autoAnimateRef, elementRef);
    const cards = allCards.filter((card) => card.listId === listId);

    const onNewCardClose = useCallback(() => {
        setIsAddingNewCard(false);
    }, [setIsAddingNewCard]);

    const onNewCardAdded = useCallback(
        (name: string) => {
            if (!isAddingNewCard) return;
            onCreateNewCard(name, listId, isAddingNewCard === NewCardLocation.UP ? 0 : cards.length);
        },
        [cards.length, listId, isAddingNewCard, onCreateNewCard]
    );

    const addNewCardComponent = <AddNewCard listId={listId} onClose={onNewCardClose} onSave={onNewCardAdded} />;

    if (elementRef.current) {
        autoAnimate(elementRef.current, (element, action, oldCoords, newCoords) => {
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
            ref={ref}
            className={clsx(
                "flex h-full max-h-full cursor-default flex-col gap-4 overflow-y-auto overflow-x-hidden px-5 delay-200 duration-500 will-change-auto",
                cards.length === 0 && !isAddingNewCard && !isOnHover ? "py-0" : "py-5"
            )}
        >
            {isAddingNewCard === NewCardLocation.UP && addNewCardComponent}

            {cards.map((card) => {
                return <Card key={card.id} {...card} />;
            })}

            {isAddingNewCard === NewCardLocation.DOWN && addNewCardComponent}
        </div>
    );
};

const List = ({ id, title }: BoardList) => {
    const [isAddingNewCard, setIsAddingNewCard] = useState<NewCardLocation.UP | NewCardLocation.DOWN | false>(false);

    const onNewCardTopClick = useCallback(() => {
        setIsAddingNewCard(NewCardLocation.UP);
    }, []);

    const onNewCardBottomClick = useCallback(() => {
        setIsAddingNewCard(NewCardLocation.DOWN);
    }, []);

    return (
        <Draggable<HTMLDivElement> id={id} type={SortableType.List} lockY>
            {({ ref, handleRef }, { isDragging }) => (
                <div
                    ref={ref}
                    className="ts-sm relative flex h-max max-h-full w-full max-w-sm shrink-0 flex-col overflow-hidden rounded-lg border border-dark-600 bg-dark-800 font-manrope text-dark-50"
                >
                    <div
                        ref={handleRef}
                        className={clsx(
                            "flex w-full items-center justify-between gap-4 px-7 py-4 duration-200 hover:bg-dark-600",
                            isDragging ? "cursor-grabbing bg-dark-600" : "cursor-grab bg-dark-900"
                        )}
                    >
                        <span className={clsx("rounded-full bg-dark-50 px-3 py-1 font-bold text-dark-900", !isDragging && "cursor-pointer")}>{title}</span>

                        <div className="flex items-center gap-3">
                            {!isAddingNewCard && <IconPlus height={20} className="duration-200 hover:opacity-75" onClick={onNewCardTopClick} />}
                            <IconDots height={20} className="duration-200 hover:opacity-75" />
                        </div>
                    </div>

                    <Droppable<HTMLDivElement> id={id} sortable sortableDirection={SortableDirection.Vertical} accepts={[SortableType.Card]}>
                        {({ ref }, { isHovered }) => <CardDropZone isAddingNewCard={isAddingNewCard} setIsAddingNewCard={setIsAddingNewCard} isOnHover={isHovered} listId={id} innerRef={ref} />}
                    </Droppable>

                    {!isAddingNewCard && (
                        <button
                            className="ts-base flex items-center justify-center gap-2 border border-dark-600 bg-dark-700 p-2 text-center duration-200 hover:opacity-75"
                            onClick={onNewCardBottomClick}
                        >
                            <IconPlus height={15} />
                            <p>Add Card</p>
                        </button>
                    )}
                </div>
            )}
        </Draggable>
    );
};

export default memo(List);
