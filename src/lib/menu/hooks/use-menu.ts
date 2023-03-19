import type { MenuVariantType } from "@/lib/menu";

import { MenuVariant, MenuAnchor, MenuContext, MenuAlignment, MenuDirection } from "@/lib/menu";

import { useId } from "@mantine/hooks";
import { useCallback, useContext, useRef } from "react";

export type MenuOptions = MenuVariantType & {
    anchor?: MenuAnchor;
    direction?: MenuDirection;
    alignment?: MenuAlignment;
    offset?: {
        x?: number;
        y?: number;
    };
};

export default function useMenu() {
    const currentInstanceId = useId();
    const lastAnchor = useRef<HTMLElement | null>(null);
    const {
        isOpen, //
        instanceId,
        anchor,
        clientCoordinates,
        targetRef,
        offset,
        alignment,
        direction,
        setOpen,
        setVariant,
        setInstanceId,
    } = useContext(MenuContext);

    /**
     * @description
     * Forces the menu to open at the specified coordinates.
     */
    const openMenu = useCallback(
        (event: React.MouseEvent, options: MenuOptions) => {
            event.preventDefault();
            if (!options) return;

            targetRef.current = event.currentTarget as HTMLElement;
            lastAnchor.current = current;
            anchor.current = options.anchor ?? MenuAnchor.Element;
            alignment.current = options.alignment ?? MenuAlignment.Start;
            direction.current = options.direction ?? MenuDirection.Right;

            offset.current = {
                x: options.offset?.x ?? 0,
                y: options.offset?.y ?? 0,
            };

            clientCoordinates.current = {
                x: event.clientX,
                y: event.clientY,
            };

            setInstanceId(currentInstanceId);
            setVariant(options);
            setOpen(true);
        },
        [targetRef, anchor, alignment, direction, offset, clientCoordinates, setInstanceId, currentInstanceId, setVariant, setOpen]
    );

    /**
     * @description
     * Closes the menu.
     */
    const closeMenu = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    /**
     * @description
     * Toggles the menu state. Closes the menu if it's open, and opens it if it's closed.
     */
    const toggleMenu = useCallback(
        (event: React.MouseEvent, options: MenuOptions) => {
            event.preventDefault();
            if (!options) return;

            if (isOpen && instanceId === currentInstanceId && lastAnchor.current === event.currentTarget) {
                closeMenu();
            } else {
                openMenu(event, options);
            }
        },
        [isOpen, instanceId, currentInstanceId, closeMenu, openMenu]
    );

    return {
        openMenu,
        closeMenu,
        toggleMenu,
    };
}
