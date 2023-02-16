import type { DetailedHTMLProps, HTMLAttributes } from "react";

import { ContextMenuContext, ControlledMenuVariant, TargetPosition } from ".";

import { useEffect, useState, memo, useContext, useRef } from "react";

const ContextMenu = () => {
    const menuRef = useRef<HTMLDivElement>(null);
    const {
        isOpen,
        offset, //
        targetRef,
        targetPosition,
        lists,
        type,
        setOpen,
        clientCoordinates,
    } = useContext(ContextMenuContext);

    const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
    const { x: clientX, y: clientY } = clientCoordinates.current;
    const { x: offsetX, y: offsetY } = offset.current;

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
                if (targetPosition.current === TargetPosition.Cursor) {
                    colliderOffsetX = posX + cursorOffsetX + menuElement.offsetWidth - windowWidth;
                } else {
                    colliderOffsetX = posX + width + menuElement.offsetWidth - windowWidth;
                }
            }

            if (!colliderOffsetY && posY + cursorOffsetY + menuElement.offsetHeight > windowHeight) {
                if (targetPosition.current === TargetPosition.Cursor) {
                    colliderOffsetY = posY + cursorOffsetY + menuElement.offsetHeight - windowHeight;
                } else {
                    colliderOffsetY = posY + height + menuElement.offsetHeight - windowHeight;
                }
            }

            let usedX =
                targetPosition.current === TargetPosition.Cursor //
                    ? posX + cursorOffsetX
                    : posX + width;

            let usedY =
                targetPosition.current === TargetPosition.Cursor //
                    ? posY + cursorOffsetY
                    : posY;

            setCoordinates({
                x: usedX - colliderOffsetX + offsetX,
                y: usedY - colliderOffsetY + offsetY,
            });
        };

        if (isOpen) {
            setMenuCoordinates();
            registerScrollableParents(targetElement);

            document.addEventListener("click", handleBlur);

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
    }, [isOpen, targetRef, setOpen, clientX, clientY, targetPosition, offsetX, offsetY]);

    if (isOpen) {
        const sharedProps: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> = {
            ref: menuRef,
            style: {
                transform: `translate(${coordinates.x}px, ${coordinates.y}px)`,
                zIndex: 999999,
            },
        };

        if (type === ControlledMenuVariant.ContextMenu) {
            return (
                <section {...sharedProps} className="fixed flex flex-col rounded-lg border border-dark-600 bg-dark-700 text-white">
                    {lists.map(({ icon: Icon, name }, index) => (
                        <button key={index} className="flex items-center gap-3 px-5 py-3">
                            <Icon height={16} width={undefined} />
                            <span className="ts-sm">{name}</span>
                        </button>
                    ))}
                </section>
            );
        }
    }

    return null;
};

export default memo(ContextMenu);
