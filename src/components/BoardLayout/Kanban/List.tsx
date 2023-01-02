import type { CSSProperties } from "react";
import type { PageProps } from "@/pages/projects/[id]";

import { SortableType } from ".";

import { CardContainer } from "@/components/BoardLayout/Kanban/Card";

import { useClickOutside, useLocalStorage } from "@mantine/hooks";
import { useCallback, useState } from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ScrollArea, Textarea } from "@mantine/core";
import { IconDots, IconPlus } from "@tabler/icons";

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
            <Textarea
                placeholder="Enter your card title here" //
                label="Add New Card"
                variant="filled"
                value={value}
                withAsterisk
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
    onCardAdded: (name: string, listId: string) => void;
};

export const List = ({ id, name, cards, onCardAdded }: ListProps) => {
    enum NewCardLocation {
        UP = "UP",
        DOWN = "DOWN",
    }

    const [cardListRef] = useAutoAnimate<HTMLDivElement>();
    const [isAddingNewCard, setIsAddingNewCard] = useState<NewCardLocation.UP | NewCardLocation.DOWN | false>(false);
    const { setNodeRef, listeners, transform, transition, attributes } = useSortable({
        id,
        data: {
            id,
            name,
            type: SortableType.List,
        },
    });

    const style: CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
    };

    const onNewCardClick = (location: NewCardLocation) => {
        setIsAddingNewCard(location);

        if (location === NewCardLocation.UP) {
            cardListRef.current?.scrollTo(0, 0);
        }

        if (location === NewCardLocation.DOWN) {
            cardListRef.current?.scrollTo(0, cardListRef.current.scrollHeight);
        }
    };

    const onNewCardClose = useCallback(() => {
        setIsAddingNewCard(false);
    }, []);

    const onNewCardAdded = useCallback(
        (name: string) => {
            onCardAdded(name, id);
        },
        [id, onCardAdded]
    );

    const addCardComponent = <AddCardComponent listId={id} onClose={onNewCardClose} onSave={onNewCardAdded} />;

    return (
        <div
            {...listeners}
            {...attributes}
            ref={setNodeRef}
            style={style}
            className="group/container relative flex h-max max-h-full w-60 cursor-pointer flex-col gap-4 overflow-auto rounded-md text-sm"
        >
            <div className="flex w-full items-center justify-between gap-4 border-b border-b-dark-700 pb-3 duration-200">
                <span className="rounded-md bg-dark-700 px-3 py-1 font-semibold">{name}</span>

                <div className="flex items-center gap-2">
                    <IconPlus height={20} className="duration-200 hover:opacity-75" onClick={() => onNewCardClick(NewCardLocation.UP)} />
                    <IconDots height={20} className="duration-200 hover:opacity-75" />
                </div>
            </div>

            <ScrollArea className="flex flex-col overflow-y-auto overflow-x-hidden">
                <div ref={cardListRef} className="hide-scrollbar flex max-h-full flex-col gap-4 overflow-y-auto overflow-x-hidden">
                    {isAddingNewCard === NewCardLocation.UP && addCardComponent}

                        <SortableContext strategy={rectSortingStrategy} items={cards.flatMap(({ id }) => id)}>
                            {cards.map((card) => {
                                return <CardContainer key={card.id} {...card} />;
                            })}
                        </SortableContext>

                    {isAddingNewCard === NewCardLocation.DOWN && addCardComponent}
                </div>
            </ScrollArea>

            <button
                className="flex items-center justify-center gap-2 rounded-md border border-dashed border-dark-600 bg-dark-800 p-2 text-center duration-200 hover:bg-dark-700/50"
                onClick={() => onNewCardClick(NewCardLocation.DOWN)}
            >
                <IconPlus height={15} />
                <p>Add Card</p>
            </button>
        </div>
    );
};
