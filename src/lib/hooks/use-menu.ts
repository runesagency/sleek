import type { ContextMenuProps } from "@/components/ContextMenu";

import useCustomEvent from "@/lib/hooks/use-custom-event";

import { useMenuState } from "@szhsin/react-menu";
import { useCallback, useEffect, useState } from "react";

type MenuProps = Omit<ContextMenuProps, "x" | "y" | "customId">;

export default function useMenu(defaultOptions?: MenuProps) {
    const { data, emit, customId } = useCustomEvent<ContextMenuProps | null>("ctx-menu", false);
    const [options, setOptions] = useState<MenuProps | null>(defaultOptions || null);

    const [menuProps, toggleMenuState] = useMenuState({
        initialOpen: false,
        transition: {
            open: true,
            close: true,
        },
    });

    const [anchorPoint, setAnchorPoint] = useState({
        x: 0,
        y: 0,
    });

    const open = menuProps.state === "open" || menuProps.state === "opening";

    useEffect(() => {
        if (data) {
            setAnchorPoint({
                x: data.x,
                y: data.y,
            });

            toggleMenuState(true);
        } else {
            toggleMenuState(false);
        }

        return () => {
            toggleMenuState(false);
        };
    }, [data, toggleMenuState]);

    const openMenu = useCallback(
        (event: React.MouseEvent) => {
            event.preventDefault();
            if (!options) return;

            const anchorPoint = {
                x: event.clientX,
                y: event.clientY,
            };

            toggleMenuState(true);
            setAnchorPoint(anchorPoint);

            emit({
                customId,
                ...anchorPoint,
                ...options,
            });
        },
        [customId, emit, options, toggleMenuState]
    );

    const closeMenu = useCallback(() => {
        toggleMenuState(false);
        emit(null);
    }, [emit, toggleMenuState]);

    const toggleMenu = useCallback(
        (event: React.MouseEvent) => {
            event.preventDefault();
            if (!options) return;

            if (open && data?.customId === customId) {
                closeMenu();
            } else {
                openMenu(event);
            }
        },
        [options, open, data?.customId, customId, closeMenu, openMenu]
    );

    return {
        open,
        data,
        options,
        menuProps,
        anchorPoint,
        openMenu,
        closeMenu,
        toggleMenu,
        setOptions,

        /** !!! Don't use this unless you know what you're doing !!! */
        toggleMenuState,
    };
}
