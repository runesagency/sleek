import type { MenuVariantContextItem } from "@/lib/context-menu";
import type { MenuSharedProps } from "@/lib/context-menu/components/Menu";

import { MenuVariant } from "@/lib/context-menu";

import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";

type MenuContextVariantItemProps = MenuVariantContextItem & {
    index: number;
    activeIndex: number;
    closeMenu: () => void;
    setActiveIndex: (index: number) => void;
};

const MenuContextVariantItem = ({ icon: Icon, name, onClick: onItemClick, href, index, activeIndex, closeMenu, setActiveIndex }: MenuContextVariantItemProps) => {
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
        <Component href={href ?? "#"} onClick={onClick} onMouseOver={onHover} className={clsx("flex items-center gap-3 px-5 py-3", activeIndex === index && "bg-dark-800")}>
            <Icon height={16} width={undefined} />
            <span className="ts-sm">{name}</span>
        </Component>
    );
};

const MenuContextVariant = ({ variant, innerRef, closeMenu, ...props }: MenuSharedProps) => {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);

    const { type, lists } = variant;

    useEffect(() => {
        if (type !== MenuVariant.Context) return;

        const handleKeyDown = (e: KeyboardEvent) => {
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
                    } else if (list.href && router.isReady) {
                        router.push(list.href);
                    }

                    closeMenu();
                    break;
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [activeIndex, closeMenu, lists, lists.length, router, type]);

    if (type !== MenuVariant.Context) return null;

    return (
        <section ref={innerRef} {...props} className="fixed flex flex-col overflow-hidden rounded-lg border border-dark-600 bg-dark-700 text-white">
            {lists.map((props, index) => (
                <MenuContextVariantItem key={props.name} {...props} index={index} activeIndex={activeIndex} closeMenu={closeMenu} setActiveIndex={setActiveIndex} />
            ))}
        </section>
    );
};

export default memo(MenuContextVariant);
