import type { DetailedHTMLProps, HTMLAttributes } from "react";

import { MenuContext, MenuVariant, MenuAnchor, MenuDirection, MenuAlignment } from "@/lib/menu";
import MenuContextComponent from "@/lib/menu/components/variants/Context";
import MenuFormComponent from "@/lib/menu/components/variants/Form";
import MenuMemberListComponent from "@/lib/menu/components/variants/MemberList";

import { useCallback, useEffect, useState, memo, useContext, useRef } from "react";

export type MenuSharedProps = Omit<DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>, "ref" | "onClick" | "onSelect" | "onSubmit"> & {
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

        const onBlur = (e: MouseEvent) => {
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

            let usedX = 0;
            let usedY = 0;

            if (anchor.current === MenuAnchor.Cursor) {
                const locX = posX + cursorOffsetX;
                const locY = posY + cursorOffsetY;

                switch (direction.current) {
                    // Horizontal
                    case MenuDirection.Right:
                    case MenuDirection.Left: {
                        if (alignment.current === MenuAlignment.Start) {
                            if (!colliderOffsetY && locY + menuElement.offsetHeight > windowHeight) {
                                colliderOffsetY = locY + menuElement.offsetHeight - windowHeight;
                            }

                            usedY = locY - offsetY - colliderOffsetY;
                        } else if (alignment.current === MenuAlignment.Center) {
                            const pos = locY - offsetY - menuElement.offsetHeight / 2;

                            if (!colliderOffsetY) {
                                if (locY + menuElement.offsetHeight > windowHeight) {
                                    colliderOffsetY = locY + menuElement.offsetHeight / 2 - windowHeight;
                                }

                                if (pos < 0) {
                                    colliderOffsetY = pos;
                                }
                            }

                            usedY = pos - colliderOffsetY;
                        } else if (alignment.current === MenuAlignment.End) {
                            const pos = locY - offsetY - menuElement.offsetHeight;

                            if (!colliderOffsetY && pos < 0) {
                                colliderOffsetY = pos;
                            }

                            usedY = pos - colliderOffsetY;
                        }

                        if (direction.current === MenuDirection.Right) {
                            const pos = locX - offsetX;

                            if (!colliderOffsetX && pos + menuElement.offsetWidth > windowWidth) {
                                colliderOffsetX = pos + menuElement.offsetWidth - windowWidth;
                            }

                            usedX = pos - colliderOffsetX;
                        } else if (direction.current === MenuDirection.Left) {
                            const pos = locX - offsetX - menuElement.offsetWidth;

                            if (!colliderOffsetX && pos < 0) {
                                colliderOffsetX = pos;
                            }

                            usedX = pos - colliderOffsetX;
                        }

                        break;
                    }

                    // Vertical
                    case MenuDirection.Top:
                    case MenuDirection.Bottom: {
                        if (alignment.current === MenuAlignment.Start) {
                            // No need for the collider to the left since the menu will
                            // be aligned to the left to begin with (to right of the cursor)
                            if (!colliderOffsetX && locX + menuElement.offsetWidth > windowWidth) {
                                colliderOffsetX = locX + menuElement.offsetWidth - windowWidth;
                            }

                            usedX = locX - colliderOffsetX;
                        } else if (alignment.current === MenuAlignment.Center) {
                            const pos = locX - menuElement.offsetWidth / 2;

                            // Define the collider to the left if the menu is out of the viewport
                            if (!colliderOffsetX) {
                                // If the menu is out of the viewport to the right
                                if (locX + menuElement.offsetWidth > windowWidth) {
                                    colliderOffsetX = locX + menuElement.offsetWidth / 2 - windowWidth;
                                }

                                // If the menu is out of the viewport to the left
                                if (pos < 0) {
                                    colliderOffsetX = pos;
                                }
                            }

                            usedX = pos - colliderOffsetX;
                        } else if (alignment.current === MenuAlignment.End) {
                            const pos = locX - menuElement.offsetWidth;

                            // No need for the collider to the right since the menu will
                            // be aligned to the right to begin with (to left of the cursor)
                            if (!colliderOffsetX && pos < 0) {
                                colliderOffsetX = pos;
                            }

                            usedX = pos - colliderOffsetX;
                        }

                        if (direction.current === MenuDirection.Top) {
                            const pos = locY - menuElement.offsetHeight;

                            // If the menu is out of the viewport to the top,
                            // set the menu's position to the top of the viewport
                            if (!colliderOffsetY && pos < 0) {
                                colliderOffsetY = pos;
                            }

                            usedY = pos - colliderOffsetY;
                        } else if (direction.current === MenuDirection.Bottom) {
                            const pos = locY + offsetY;

                            // If the menu is out of the viewport to the bottom,
                            // set the menu's position to the bottom of the viewport
                            if (!colliderOffsetY && pos + menuElement.offsetHeight > windowHeight) {
                                colliderOffsetY = pos - windowHeight - menuElement.offsetHeight;
                            }

                            usedY = pos - colliderOffsetY;
                        }

                        break;
                    }
                }
            } else {
                switch (direction.current) {
                    case MenuDirection.Right:
                    case MenuDirection.Left: {
                        if (alignment.current === MenuAlignment.Start) {
                            if (!colliderOffsetY && posY + menuElement.offsetHeight > windowHeight) {
                                colliderOffsetY = posY + menuElement.offsetHeight - windowHeight;
                            }

                            usedY = posY - colliderOffsetY;
                        } else if (alignment.current === MenuAlignment.Center) {
                            const pos = posY + height / 2 - menuElement.offsetHeight / 2;

                            if (!colliderOffsetY) {
                                if (posY + menuElement.offsetHeight > windowHeight) {
                                    colliderOffsetY = posY + menuElement.offsetHeight / 2 - windowHeight;
                                }

                                if (pos < 0) {
                                    colliderOffsetY = pos;
                                }
                            }

                            usedY = pos - colliderOffsetY;
                        } else if (alignment.current === MenuAlignment.End) {
                            const pos = posY + height - menuElement.offsetHeight;

                            if (!colliderOffsetY && pos < 0) {
                                colliderOffsetY = pos;
                            }

                            usedY = pos - colliderOffsetY;
                        }

                        if (direction.current === MenuDirection.Right) {
                            const pos = posX + width;

                            if (!colliderOffsetX && pos + menuElement.offsetWidth > windowWidth) {
                                colliderOffsetX = pos + menuElement.offsetWidth - windowWidth;
                            }

                            usedX = pos - colliderOffsetX;
                        } else if (direction.current === MenuDirection.Left) {
                            const pos = posX - menuElement.offsetWidth;

                            if (!colliderOffsetX && pos < 0) {
                                colliderOffsetX = pos;
                            }

                            usedX = pos - colliderOffsetX;
                        }

                        break;
                    }

                    case MenuDirection.Top:
                    case MenuDirection.Bottom: {
                        if (alignment.current === MenuAlignment.Start) {
                            if (!colliderOffsetX && posX + menuElement.offsetWidth > windowWidth) {
                                colliderOffsetX = posX + menuElement.offsetWidth - windowWidth;
                            }

                            usedX = posX - colliderOffsetX;
                        } else if (alignment.current === MenuAlignment.Center) {
                            const pos = posX + width / 2 - menuElement.offsetWidth / 2;

                            if (!colliderOffsetX) {
                                if (posX + menuElement.offsetWidth > windowWidth) {
                                    colliderOffsetX = posX + menuElement.offsetWidth / 2 - windowWidth;
                                }

                                if (pos < 0) {
                                    colliderOffsetX = pos;
                                }
                            }

                            usedX = pos - colliderOffsetX;
                        } else if (alignment.current === MenuAlignment.End) {
                            const pos = posX + width - menuElement.offsetWidth;

                            if (!colliderOffsetX && pos < 0) {
                                colliderOffsetX = pos;
                            }

                            usedX = pos - colliderOffsetX;
                        }

                        if (direction.current === MenuDirection.Top) {
                            const pos = posY - menuElement.offsetHeight;

                            if (!colliderOffsetY && pos < 0) {
                                colliderOffsetY = pos;
                            }

                            usedY = pos - colliderOffsetY;
                        } else if (direction.current === MenuDirection.Bottom) {
                            const pos = posY + height;

                            if (!colliderOffsetY && pos + menuElement.offsetHeight > windowHeight) {
                                colliderOffsetY = pos + menuElement.offsetHeight - windowHeight;
                            }

                            usedY = pos - colliderOffsetY;
                        }
                    }
                }
            }

            setCoordinates({
                x: usedX + offsetX,
                y: usedY + offsetY,
            });
        };

        if (data.isOpen) {
            setMenuCoordinates();
            registerScrollableParents(targetElement);

            // We need to wait for the next tick to add the click event listener
            // because the click event that triggered the menu to open will
            setTimeout(() => {
                document.addEventListener("click", onBlur);
            }, 0);

            scrollableParents.map((element) => {
                element.addEventListener("scroll", setMenuCoordinates);
            });
        }

        return () => {
            document.removeEventListener("click", onBlur);

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
                transition: "transform 0.1s ease-out",
                zIndex: 999999,
            },
        };

        switch (data.type) {
            case MenuVariant.Context: {
                return <MenuContextComponent {...sharedProps} lists={data.lists} />;
            }

            case MenuVariant.MemberList: {
                return <MenuMemberListComponent {...sharedProps} lists={data.lists} onSelect={data.onSelect} onBack={data.onBack} title={data.title} />;
            }

            case MenuVariant.Forms: {
                return <MenuFormComponent {...sharedProps} lists={data.lists} onSubmit={data.onSubmit} onBack={data.onBack} title={data.title} submitButtonLabel={data.submitButtonLabel} />;
            }
        }
    }

    return null;
};

export default memo(Menu);
