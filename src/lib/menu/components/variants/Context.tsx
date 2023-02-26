import type { MenuVariantContext, MenuVariantContextItem } from "@/lib/menu";
import type { MenuSharedProps } from "@/lib/menu/components/Menu";

import clsx from "clsx";
import Link from "next/link";
import { memo, useCallback, useEffect, useState } from "react";

type MenuContextComponentItemProps = MenuVariantContextItem & {
    index: number;
    activeIndex: number;
    closeMenu: () => void;
    setActiveIndex: (index: number) => void;
};

const MenuContextComponentItem = ({ icon: Icon, name, onClick: onItemClick, href, index, activeIndex, closeMenu, setActiveIndex }: MenuContextComponentItemProps) => {
    const Component = href ? Link : "button";

    const onClick = useCallback(() => {
        if (onItemClick) {
            onItemClick();
        }

        closeMenu();
    }, [closeMenu, onItemClick]);

    const onHover = useCallback(() => {
        setActiveIndex(index);
    }, [index, setActiveIndex]);

    if (!href && !onItemClick) return null;

    return (
        <Component id={`item-${index}`} href={href ?? "#"} onClick={onClick} onMouseOver={onHover} className={clsx("flex items-center gap-3 px-5 py-3", activeIndex === index && "bg-dark-800")}>
            <Icon height={16} width={undefined} />
            <span className="ts-sm">{name}</span>
        </Component>
    );
};

type MenuContextComponentProps = MenuSharedProps & Omit<MenuVariantContext, "type">;

const MenuContextComponent = ({ lists, innerRef, closeMenu, ...props }: MenuContextComponentProps) => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();

            switch (e.key) {
                case "ArrowDown": {
                    setActiveIndex((prev) => {
                        if (prev === lists.length - 1) return 0;
                        return prev + 1;
                    });

                    break;
                }

                case "ArrowUp": {
                    setActiveIndex((prev) => {
                        if (prev === 0) return lists.length - 1;
                        return prev - 1;
                    });

                    break;
                }

                case "Enter": {
                    const list = lists[activeIndex];
                    if (!list) return;

                    if (list.onClick) {
                        list.onClick();
                    } else if (list.href) {
                        const element = document.getElementById(`item-${activeIndex}`);

                        if (element) {
                            element.click();
                        }
                    }

                    closeMenu();
                    break;
                }
            }
        };

        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [activeIndex, closeMenu, lists, lists.length]);

    return (
        <section ref={innerRef} {...props} className="flex flex-col overflow-hidden rounded-lg border border-dark-600 bg-dark-700 text-dark-50">
            {lists.map((props, index) => (
                <MenuContextComponentItem key={props.name} {...props} index={index} activeIndex={activeIndex} closeMenu={closeMenu} setActiveIndex={setActiveIndex} />
            ))}
        </section>
    );
};

export default memo(MenuContextComponent);
