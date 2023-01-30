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

export const constants = {
    dataAttribute: {
        droppable: "data-droppable",
        sortable: "data-sortable",
        sortableDirection: "data-sortable-direction",
        accepts: "data-accepts",
    },
};

export default function useDroppable<T extends HTMLElement = HTMLDivElement>({ accepts, sortable, sortableDirection }: useDroppableOptions) {
    const ref = useRef<T>(null);

    useEffect(() => {
        const current = ref.current;

        if (current) {
            current.setAttribute(constants.dataAttribute.droppable, "true");

            if (sortable) {
                current.setAttribute(constants.dataAttribute.sortable, "true");
                current.setAttribute(constants.dataAttribute.sortableDirection, sortableDirection);
            } else {
                current.removeAttribute(constants.dataAttribute.sortable);
                current.removeAttribute(constants.dataAttribute.sortableDirection);
            }

            if (accepts) {
                current.setAttribute(constants.dataAttribute.accepts, accepts.join(","));
            } else {
                current.removeAttribute(constants.dataAttribute.accepts);
            }
        }

        return () => {
            if (current) {
                current.removeAttribute(constants.dataAttribute.droppable);
                current.removeAttribute(constants.dataAttribute.sortable);
                current.removeAttribute(constants.dataAttribute.sortableDirection);
                current.removeAttribute(constants.dataAttribute.accepts);
            }
        };
    }, [accepts, ref, sortable, sortableDirection]);

    return {
        ref,
    };
}