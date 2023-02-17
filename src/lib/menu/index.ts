import type { MenuContextProps } from "@/lib/menu/types.d";

import { MenuAlignment, MenuDirection, MenuAnchor } from "@/lib/menu/types.d";

import { createContext } from "react";

const defaultUninitializedFunction = () => {
    throw new Error("ControlledMenuContext is not initialized");
};

const defaultRefValue = <T>(value: T): React.MutableRefObject<T> => ({
    current: value,
});

export const MenuContext = createContext<MenuContextProps>({
    instanceId: "",
    isOpen: false,
    type: null,
    lists: null,
    targetRef: defaultRefValue(null),
    offset: defaultRefValue({ x: 0, y: 0 }),
    clientCoordinates: defaultRefValue({ x: 0, y: 0 }),
    anchor: defaultRefValue(MenuAnchor.Element),
    direction: defaultRefValue(MenuDirection.Right),
    alignment: defaultRefValue(MenuAlignment.Start),
    setOpen: defaultUninitializedFunction,
    setVariant: defaultUninitializedFunction,
    setInstanceId: defaultUninitializedFunction,
});

export * from "./types.d";
export { default as useMenu } from "./hooks/use-menu";
export { default as Menu } from "./components/Menu";
export { default as MenuProvider } from "./components/MenuProvider";
