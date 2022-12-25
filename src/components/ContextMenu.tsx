import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/theme-dark.css";
import "@szhsin/react-menu/dist/transitions/slide.css";

import useMenu from "@/lib/hooks/use-menu";

import { useClickOutside } from "@mantine/hooks";
import { ControlledMenu, FocusableItem, MenuDivider, MenuItem } from "@szhsin/react-menu";
import { useEffect, useRef, useState } from "react";

export type ContextMenuItem = {
    subMenu?: ContextMenuItem[];
} & (
    | ({
          type?: "checkbox" | "radio";
          group?: string;
      } & (
          | {
                label: string;
                onClick?: () => void;
            }
          | {
                node: (props: { checked: boolean }) => JSX.Element;
            }
      ))
    | {
          divider: true;
      }
);

export type ContextMenuProps = {
    customId: string;
    x: number;
    y: number;
    withFilter?: boolean;
    groups?: string[];
    items: ContextMenuItem[] | ((props: { filter: string }) => JSX.Element);
};

export default function ContextMenu() {
    const { data, anchorPoint, menuProps, open, closeMenu, toggleMenuState } = useMenu();
    const [filter, setFilter] = useState("");
    const lastDataReceivedTime = useRef(0);

    const detectBlurRef = useClickOutside(() => {
        const closingTime = Date.now();

        // I SPENT A WHOLE DAY FOR THIS, DON'T MESS WITH IT!
        // Wait for 200ms to see if there is a new click event
        setTimeout(() => {
            if (lastDataReceivedTime.current < closingTime) {
                closeMenu();
            } else {
                toggleMenuState(true);
            }
        }, 200);
    });

    useEffect(() => {
        if (data) {
            const time = Date.now();
            lastDataReceivedTime.current = time;
        }
    }, [data]);

    if (!open) {
        return null;
    }

    return (
        <ControlledMenu {...menuProps} ref={detectBlurRef} anchorPoint={anchorPoint} direction="right" offsetX={10} position="auto" initialMounted align="start" theming="dark">
            {data?.withFilter && <FocusableItem>{({ ref }) => <input ref={ref} type="text" placeholder="Type to filter" value={filter} onChange={(e) => setFilter(e.target.value)} />}</FocusableItem>}

            {data?.items instanceof Function ? (
                <data.items filter={filter} />
            ) : (
                data?.items.map((item, index) => {
                    if ("divider" in item) {
                        return <MenuDivider key={index} />;
                    }

                    if ("node" in item) {
                        return <MenuItem key={index}>{item.node({ checked: false })}</MenuItem>;
                    }

                    return <MenuItem key={index}>{item.label}</MenuItem>;
                })
            )}
        </ControlledMenu>
    );
}
