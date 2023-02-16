import type { MenuContextProps } from "@/lib/context-menu/types";

import { MenuPosition } from "@/lib/context-menu/types.d";

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
    targetPosition: defaultRefValue(MenuPosition.Element),
    setOpen: defaultUninitializedFunction,
    setVariant: defaultUninitializedFunction,
    setInstanceId: defaultUninitializedFunction,
    setTargetRef: defaultUninitializedFunction,
    setClientCoordinates: defaultUninitializedFunction,
    setTargetPosition: defaultUninitializedFunction,
    setOffset: defaultUninitializedFunction,
});

export * from "./types.d";
export { default as useMenu } from "./hooks/use-menu";
export { default as Menu } from "./components/Menu";
export { default as MenuProvider } from "./components/MenuProvider";
