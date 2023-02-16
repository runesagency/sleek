import type { ControlledMenuVariantType } from ".";

import { TargetPosition, ContextMenuContext } from ".";

import { useId } from "@mantine/hooks";
import { useCallback, useContext } from "react";

export type MenuOptions = ControlledMenuVariantType & {
    position?: TargetPosition;
    offset?: {
        x: number;
        y: number;
    };
};

export default function useContextMenu() {
    const currentInstanceId = useId();
    const {
        isOpen, //
        instanceId,
        setOpen,
        setOffset,
        setVariant,
        setTargetRef,
        setInstanceId,
        setTargetPosition,
        setClientCoordinates,
    } = useContext(ContextMenuContext);

    /**
     * @description
     * Forces the menu to open at the specified coordinates.
     */
    const openMenu = useCallback(
        (event: React.MouseEvent, options: MenuOptions) => {
            event.preventDefault();
            if (!options) return;

            setOpen(true);
            setInstanceId(currentInstanceId);
            setTargetRef(event.currentTarget as HTMLElement);
            setVariant(options);
            setClientCoordinates(event.clientX, event.clientY);
            setTargetPosition(options.position ?? TargetPosition.Element);
            setOffset(options.offset?.x ?? 0, options.offset?.y ?? 0);
        },
        [setOpen, setInstanceId, currentInstanceId, setTargetRef, setVariant, setClientCoordinates, setTargetPosition, setOffset]
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

            if (isOpen && instanceId === currentInstanceId) {
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
