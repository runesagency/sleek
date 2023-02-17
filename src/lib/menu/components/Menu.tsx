import type { DetailedHTMLProps, HTMLAttributes } from "react";

import { MenuContext, MenuVariant, MenuAnchor, MenuDirection, MenuAlignment } from "@/lib/menu";
import MenuContextVariant from "@/lib/menu/components/variants/Context";
import MenuMemberListVariant from "@/lib/menu/components/variants/MemberList";

import { useCallback, useEffect, useState, memo, useContext, useRef } from "react";

export type MenuSharedProps = Omit<DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>, "ref" | "onClick" | "onSelect"> & {
    innerRef: React.RefObject<HTMLDivElement>;
    closeMenu: () => void;
};

const Menu = () => {
    const menuRef = useRef<HTMLDivElement>(null);

    const { offset, targetRef, anchor, alignment, direction, setOpen, clientCoordinates, ...data } = useContext(MenuContext);

    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
    const { x: clientX, y: clientY } = clientCoordinates.current;
    const { x: offsetX, y: offsetY } = offset.current;

    const closeMenu = useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    useEffect(() => {
        const menuElement = menuRef.current;
        if (!menuElement) return;

        const targetElement = targetRef.current;
        if (!targetElement) return;

        let scrollableParents: HTMLElement[] = [];

        // The offset of the cursor from the top-left corner of the target element
        let cursorOffsetX = 0;
        let cursorOffsetY = 0;

        // If the menu is out of the viewport, this will be used to offset the menu's position
        let colliderOffsetX = 0;
        let colliderOffsetY = 0;

        const handleBlur = (e: MouseEvent) => {
            if (!menuElement.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        const registerScrollableParents = (element: HTMLElement) => {
            const parent = element.parentElement;

            if (parent) {
                if (parent.scrollHeight > parent.clientHeight) {
                    scrollableParents.push(parent);
                }

                if (parent.scrollWidth > parent.clientWidth) {
                    scrollableParents.push(parent);
                }

                registerScrollableParents(parent);
            }
        };

        const setMenuCoordinates = () => {
            const { x: posX, y: posY, width, height } = targetElement.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            if (cursorOffsetX === 0 && cursorOffsetY === 0) {
                cursorOffsetX = clientX - posX;
                cursorOffsetY = clientY - posY;
            }

            if (!colliderOffsetX && posX + cursorOffsetX + menuElement.offsetWidth > windowWidth) {
                if (targetPosition.current === MenuPosition.Cursor) {
                    colliderOffsetX = posX + cursorOffsetX + menuElement.offsetWidth - windowWidth;
                } else {
                    colliderOffsetX = posX + width + menuElement.offsetWidth - windowWidth;
                }
            }

            if (!colliderOffsetY && posY + cursorOffsetY + menuElement.offsetHeight > windowHeight) {
                if (targetPosition.current === MenuPosition.Cursor) {
                    colliderOffsetY = posY + cursorOffsetY + menuElement.offsetHeight - windowHeight;
                } else {
                    colliderOffsetY = posY + height + menuElement.offsetHeight - windowHeight;
                }
            }

            let usedX =
                targetPosition.current === MenuPosition.Cursor //
                    ? posX + cursorOffsetX
                    : posX + width;

            let usedY =
                targetPosition.current === MenuPosition.Cursor //
                    ? posY + cursorOffsetY
                    : posY;

            setCoordinates({
                x: usedX - colliderOffsetX + offsetX,
                y: usedY - colliderOffsetY + offsetY,
            });
        };

        if (data.isOpen) {
            setMenuCoordinates();
            registerScrollableParents(targetElement);

            // We need to wait for the next tick to add the click event listener
            // because the click event that triggered the menu to open will
            setTimeout(() => {
                document.addEventListener("click", handleBlur);
            }, 0);

            scrollableParents.map((element) => {
                element.addEventListener("scroll", setMenuCoordinates);
            });
        }

        return () => {
            document.removeEventListener("click", handleBlur);

            scrollableParents.map((element) => {
                element.removeEventListener("scroll", setMenuCoordinates);
            });
        };
    }, [data.isOpen, targetRef, setOpen, clientX, clientY, anchor, offsetX, offsetY, direction, alignment]);

    if (data.isOpen) {
        const sharedProps: Omit<MenuSharedProps, "variant"> = {
            innerRef: menuRef,
            closeMenu,
            style: {
                position: "fixed",
                transform: `translate(${coordinates.x}px, ${coordinates.y}px)`,
                zIndex: 999999,
            },
        };

        switch (data.type) {
            case MenuVariant.Context: {
                return <MenuContextVariant {...sharedProps} {...data} />;
            }

            case MenuVariant.MemberList: {
                return <MenuMemberListVariant {...sharedProps} {...data} />;
            }
        }
    }

    return null;
};

export default memo(Menu);
