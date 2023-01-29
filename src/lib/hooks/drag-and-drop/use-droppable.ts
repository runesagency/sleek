import { useEffect, useRef } from "react";

export enum SortableDirection {
    Vertical = "vertical",
    Horizontal = "horizontal",
}

export type useDroppableOptions = {
    accepts?: string[];
} & (
    | {
          sortable: true;
          sortableDirection: SortableDirection;
      }
    | {
          sortable: false;
          sortableDirection: never;
      }
);

export default function useDroppable<T extends HTMLElement = HTMLDivElement>({ accepts, sortable, sortableDirection }: useDroppableOptions) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const current = ref.current;

        if (current) {
            current.dataset.droppable = "true";

            if (sortable) {
                current.dataset.sortable = "true";
                current.dataset.sortableDirection = sortableDirection;
            } else {
                current.removeAttribute("data-sortable");
                current.removeAttribute("data-sortable-direction");
            }

            if (accepts) {
                current.dataset.accepts = accepts.join(",");
            } else {
                current.removeAttribute("data-accepts");
            }
        }

        return () => {
            if (current) {
                current.removeAttribute("data-droppable");
                current.removeAttribute("data-sortable");
                current.removeAttribute("data-sortable-direction");
                current.removeAttribute("data-accepts");
            }
        };
    }, [accepts, ref, sortable, sortableDirection]);

    return {
        ref,
    };
}
