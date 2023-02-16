import type { MenuVariantMemberList } from "@/lib/menu";
import type { MenuSharedProps } from "@/lib/menu/components/Menu";
import type { users as User } from "@prisma/client";

import Input from "@/components/Forms/Input";
import Avatar from "@/components/Miscellaneous/Avatar";

import { IconChevronLeft } from "@tabler/icons";
import clsx from "clsx";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useState } from "react";

type MenuMemberListVariantItemProps = User & {
    index: number;
    activeIndex: number;
    closeMenu: () => void;
    onItemClick: (user: User) => void;
    setActiveIndex: (index: number) => void;
};

const MenuMemberListVariantItem = ({ onItemClick, index, activeIndex, closeMenu, setActiveIndex, ...props }: MenuMemberListVariantItemProps) => {
    const { name } = props;

    const onClick = useCallback(() => {
        onItemClick(props);
        closeMenu();
    }, [closeMenu, onItemClick, props]);

    const onHover = useCallback(() => {
        setActiveIndex(index);
    }, [index, setActiveIndex]);

    return (
        <button key={index} onClick={onClick} onMouseOver={onHover} className={clsx("flex items-center gap-2 rounded-lg p-2", activeIndex === index && "bg-dark-800")}>
            <Avatar className="h-6 w-6 rounded-full" config={{ seed: name }} />
            <span className="ts-sm">{name}</span>
        </button>
    );
};

const MenuMemberListVariant = ({ lists, onSelect: onClick, onBack, title, innerRef, closeMenu, ...props }: MenuSharedProps & Omit<MenuVariantMemberList, "type">) => {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);
    const [filter, setFilter] = useState("");

    const filteredLists = lists.filter((list) => {
        if (filter === "") return true;

        return list.name.toLowerCase().includes(filter.toLowerCase());
    });

    const onSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(e.target.value);
    }, []);

    const onReturnBack = useCallback(() => {
        if (!onBack) return;

        onBack();
        closeMenu();
    }, [closeMenu, onBack]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowDown": {
                    e.preventDefault();

                    setActiveIndex((prev) => {
                        if (prev === filteredLists.length - 1) return 0;
                        return prev + 1;
                    });

                    break;
                }

                case "ArrowUp": {
                    e.preventDefault();

                    setActiveIndex((prev) => {
                        if (prev === 0) return filteredLists.length - 1;
                        return prev - 1;
                    });

                    break;
                }

                case "Enter": {
                    e.preventDefault();

                    onClick(filteredLists[activeIndex]);
                    closeMenu();
                    break;
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [activeIndex, closeMenu, filteredLists, filteredLists.length, onClick, router]);

    return (
        <section ref={innerRef} {...props} className="flex w-72 flex-col overflow-hidden rounded-lg border border-dark-600 bg-dark-700 text-white">
            <header className="flex items-center justify-between gap-2 bg-dark-600 px-5 py-2">
                {onBack ? <IconChevronLeft height={20} width={undefined} className="cursor-pointer duration-200 hover:opacity-75" onClick={onReturnBack} /> : <div />}

                <span className="ts-sm">{title || "Member List"}</span>

                <div />
            </header>

            <main className="flex flex-col gap-5 p-5">
                <Input.Small value={filter} onChange={onSearch} placeholder="Enter Member Name..." autoFocus />

                <div className="flex flex-col gap-2">
                    {filteredLists.map((props, index) => (
                        <MenuMemberListVariantItem key={index} {...props} index={index} activeIndex={activeIndex} closeMenu={closeMenu} setActiveIndex={setActiveIndex} onItemClick={onClick} />
                    ))}
                </div>
            </main>
        </section>
    );
};

export default memo(MenuMemberListVariant);
