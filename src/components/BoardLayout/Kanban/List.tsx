import type { CSSProperties } from "react";
import type { PageProps } from "@/pages/projects/[id]";

import { SortableType } from ".";

import { CardContainer } from "@/components/BoardLayout/Kanban/Card";

import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { ScrollArea, Textarea } from "@mantine/core";
type ListProps = PageProps["lists"][0] & {
    cards: PageProps["cards"];
    onCardClick: (card: PageProps["cards"][0]) => void;
    onCardAdded: (name: string) => void;
};

export const List = ({ id, name, cards, onCardClick, onCardAdded }: ListProps) => {

    const [cardListRef] = useAutoAnimate<HTMLDivElement>();
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

    return (
        <div
            {...listeners}
            {...attributes}
            ref={setNodeRef}
            style={style}
            className="group/container relative flex h-max max-h-full w-60 cursor-pointer flex-col gap-4 overflow-auto rounded-md text-sm"
        >
            <div className="flex w-full items-center justify-between gap-4 border-b border-b-neutral-700 pb-3 duration-200">
                <span className="rounded-md bg-neutral-700 px-3 py-1 font-semibold">{name}</span>

                <div className="flex items-center gap-2">
                    <button className="material-icons-outlined text-xl duration-200 hover:opacity-75">add</button>
                    <button className="material-icons-outlined text-xl duration-200 hover:opacity-75">more_horiz</button>
                </div>
            </div>

            <ScrollArea className="flex flex-col overflow-y-auto overflow-x-hidden">
                <div ref={cardListRef} className="flex max-h-full flex-col gap-4 overflow-y-auto overflow-x-hidden">

                    <SortableContext strategy={verticalListSortingStrategy} items={cards.sort((a, b) => a.order - b.order).flatMap(({ id }) => id)}>
                        {cards.map((card) => {
                            return <CardContainer key={card.id} {...card} onCardClick={onCardClick} />;
                        })}
                    </SortableContext>

                </div>
            </ScrollArea>

            <button
                className="flex items-center justify-center gap-2 rounded-md border border-dashed border-neutral-600 bg-neutral-800 p-2 text-center duration-200 hover:bg-neutral-700/50"
                onClick={() => console.log(123)}
            >
                <span className="material-icons-outlined text-sm">add</span>
                Add Card
            </button>
        </div>
    );
};
