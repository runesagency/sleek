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
    const lastOptions = useRef<MenuOptions | null>(null);
    const lastEvent = useRef<React.MouseEvent | null>(null);

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

            /**
             * This is some trick to prevent parent menu items from being opened if
             * the current item that are targeting has its own menu.first-letter:
             *
             * Since HTML doesn't support getEventListeners, what i'm doing here is
             * setting a data attribute to all target elements that have a menu.
             *
             * Then, when the event is triggered, i'm checking if the target element
             * or its parents have the data attribute. If it does, then that menu
             * will be opened, otherwise, the current menu will be opened.
             */
            const attributeName = "data-has-menu";
            event.currentTarget.setAttribute(attributeName, "true");
            if (event.target instanceof HTMLElement) {
                const getParentWithMenuAttribute = (element: HTMLElement): HTMLElement | null => {
                    if (element.hasAttribute(attributeName)) {
                        return element;
                    } else {
                        if (element.parentElement) {
                            return getParentWithMenuAttribute(element.parentElement);
                        } else {
                            return null;
                        }
                    }
                };

                const element = getParentWithMenuAttribute(event.target);
                if (element && element !== event.currentTarget) return;
            }

            const current = event.currentTarget as HTMLElement;
            lastAnchor.current = current;
            targetRef.current = current;

            lastOptions.current = options;
            lastEvent.current = {
                ...event,
                preventDefault: event.preventDefault,
                currentTarget: current,
            };

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

    const openSubMenu = useCallback(
        (options: MenuOptions) => {
            if (!options) return;

            if (!lastEvent.current) {
                throw new Error("Cannot open submenu without main menu being opened");
            }

            if (options.type !== MenuVariant.Context && !options.onBack) {
                const menuOptions = lastOptions.current;
                if (menuOptions) {
                    options.onBack = () => {
                        openSubMenu(menuOptions);
                    };
                }
            }

            openMenu(lastEvent.current, options);
        },
        [openMenu]
    );

    return {
        openMenu,
        closeMenu,
        toggleMenu,
        openSubMenu,
    };
}
