import type { MenuVariantMemberList } from "@/lib/menu";
import type { MenuSharedProps } from "@/lib/menu/components/Menu";

import Input from "@/components/Forms/Input";
import Avatar from "@/components/Miscellaneous/Avatar";

import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";

// type MenuContextVariantItemProps = MenuVariantContextItem & {
//     index: number;
//     activeIndex: number;
//     closeMenu: () => void;
//     setActiveIndex: (index: number) => void;
// };

// const MenuContextVariantItem = ({ icon: Icon, name, onClick: onItemClick, href, index, activeIndex, closeMenu, setActiveIndex }: MenuContextVariantItemProps) => {
//     const Component = href ? Link : "button";

//     const onClick = useCallback(() => {
//         if (onItemClick) {
//             onItemClick();
//         }

//         closeMenu();
//     }, [closeMenu, onItemClick]);

//     const onHover = useCallback(() => {
//         setActiveIndex(index);
//     }, [index, setActiveIndex]);

//     if (!href && !onItemClick) return null;

//     return (
//         <Component href={href ?? "#"} onClick={onClick} onMouseOver={onHover} className={clsx("flex items-center gap-3 px-5 py-3", activeIndex === index && "bg-dark-800")}>
//             <Icon height={16} width={undefined} />
//             <span className="ts-sm">{name}</span>
//         </Component>
//     );
// };

const MenuMemberListVariant = ({ lists, onClick, innerRef, closeMenu, ...props }: MenuSharedProps & Omit<MenuVariantMemberList, "type">) => {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const [filter, setFilter] = useState("");

    const filteredLists = lists.filter((list) => {
        if (filter === "") return true;

        return list.name.toLowerCase().includes(filter.toLowerCase());
    });

    useEffect(() => {
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
                    onClick(lists[activeIndex]);
                    closeMenu();
                    break;
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [activeIndex, closeMenu, lists, lists.length, onClick, router]);

    return (
        <section ref={innerRef} {...props} className="flex flex-col gap-5 overflow-hidden rounded-lg border border-dark-600 bg-dark-700 p-5 text-white">
            <Input.Small value={filter} onSave={(value) => setFilter(value)} placeholder="Enter Member Name..." />

            <div className="flex flex-col gap-4">
                {filteredLists.map((props, index) => {
                    const { name } = props;

                    return (
                        <button key={index} className="flex items-center gap-2">
                            <Avatar className="h-6 w-6" config={{ seed: name }} />
                            <span className="ts-sm">{name}</span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
};

export default memo(MenuMemberListVariant);
