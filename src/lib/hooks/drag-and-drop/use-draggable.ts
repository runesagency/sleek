import type { DragCancelEvent, DragEndEvent, DragEnterEvent, DragLeaveEvent, DragStartEvent } from "@/lib/hooks/drag-and-drop/use-drag-drop-context";

import { constants as contextConstants } from "@/lib/hooks/drag-and-drop/use-drag-drop-context";
import { SortableDirection, constants as droppableConstants } from "@/lib/hooks/drag-and-drop/use-droppable";

import { useCallback, useRef, useState, useEffect } from "react";

export type useDraggableOptions = {
    id: string;
    type: string;
    useClone?: boolean;
    activatorDistance?: number;
    visualizeCollision?: boolean;
};

export const constants = {
    dataAttribute: {
        draggable: "data-draggable",
        draggableId: "data-draggable-id",
        draggableType: "data-draggable-type",
    },
};

export default function useDraggable<T extends HTMLElement = HTMLDivElement>({ id, type, useClone = true, activatorDistance = 10, visualizeCollision }: useDraggableOptions) {
    // The element that is being dragged
    const ref = useRef<T>(null);

    // If specified, it was the element that started the drag
    const handleRef = useRef<T>(null);

    // Is the element being dragged?
    const [hasStartDragging, setHasStartDragging] = useState(false);

    // Is the element has been counted as a drag? (After it was moved X pixels)
    const [isDragging, setIsDragging] = useState(false);

    // The original position of the cursor when the drag started
    const originalCursorPos = useRef<Record<"x" | "y", number>>({ x: 0, y: 0 });

    // Function that executed that will be called after the user is clicking on the element and not dragging it
    const clickHandler = useRef<(e: MouseEvent) => void>((e) => e.preventDefault());

    const onClick = useCallback((handler: (e: MouseEvent) => void) => {
        clickHandler.current = handler;
    }, []);

    const touchHandler = useRef<(e: TouchEvent) => void>((e) => e.preventDefault());

    const onTouch = useCallback((handler: (e: TouchEvent) => void) => {
        touchHandler.current = handler;
    }, []);

    const clickOrTouchHandler = useRef<(e: MouseEvent | TouchEvent) => void>((e) => e.preventDefault());

    const onClickOrTouch = useCallback((handler: (e: MouseEvent | TouchEvent) => void) => {
        clickOrTouchHandler.current = handler;
    }, []);

    /**
     * @description
     * Handle when user starts dragging an element
     *
     * @param e a mouse or touch event
     */
    const onDragStart = useCallback((e: MouseEvent | TouchEvent) => {
        e.preventDefault();

        let clientX = 0;
        let clientY = 0;

        if (e instanceof MouseEvent) {
            clientX = e.clientX;
            clientY = e.clientY;
        } else if (e instanceof TouchEvent) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        originalCursorPos.current = { x: clientX, y: clientY };
        setHasStartDragging(true);
    }, []);

    /**
     * @description
     * Handle when user stops dragging an element
     *
     * @param e a mouse or touch event
     */
    const onDragEnd = useCallback(
        (e: MouseEvent | TouchEvent) => {
            e.preventDefault();

            // if the element is not being dragged, then it's a click/touch
            if (!isDragging) {
                if (e instanceof MouseEvent) {
                    clickHandler.current(e);
                } else if (e instanceof TouchEvent) {
                    touchHandler.current(e);
                }

                clickOrTouchHandler.current(e);
            }

            setHasStartDragging(false);
            setIsDragging(false);
        },
        [isDragging]
    );

    /**
     * @description
     * Handle component when mounted and unmounted
     */
    useEffect(() => {
        const current = ref.current;
        const handleCurrent = handleRef.current;

        if (current) {
            current.setAttribute(constants.dataAttribute.draggable, "true");
            current.setAttribute(constants.dataAttribute.draggableId, id);
            current.setAttribute(constants.dataAttribute.draggableType, type);

            current.addEventListener("mouseup", onDragEnd);
            current.addEventListener("touchend", onDragEnd);

            if (handleCurrent) {
                handleCurrent.addEventListener("mousedown", onDragStart);
                handleCurrent.addEventListener("touchstart", onDragStart);
            } else {
                current.addEventListener("mousedown", onDragStart);
                current.addEventListener("touchstart", onDragStart);
            }
        }

        return () => {
            if (current) {
                current.removeAttribute(constants.dataAttribute.draggable);
                current.removeAttribute(constants.dataAttribute.draggableId);
                current.removeAttribute(constants.dataAttribute.draggableType);

                current.removeEventListener("mouseup", onDragEnd);
                current.removeEventListener("touchend", onDragEnd);

                if (handleCurrent) {
                    handleCurrent.removeEventListener("mousedown", onDragStart);
                    handleCurrent.removeEventListener("touchstart", onDragStart);
                } else {
                    current.removeEventListener("mousedown", onDragStart);
                    current.removeEventListener("touchstart", onDragStart);
                }
            }
        };
    }, [onDragStart, onDragEnd, ref, id, type]);

    /**
     * @description
     * Handle when user is dragging an element, most of the logic goes here
     */
    useEffect(() => {
        // If the component is not mounted yet, don't go further
        const current = ref.current;
        if (!current) return;

        // The current coordinates of the cursor or touch
        let clientX = 0;
        let clientY = 0;

        // The offset of the cursor or touch from the top left corner of the dragged element
        let offsetX = 0;
        let offsetY = 0;

        // Has element moved 10px from the original position?
        // Used to prevent auto scrolling when the element is not being dragged
        let hasMove = false;

        // The element which is used to preview the new position of the dragged element (only used when the droppable is sortable)
        let placeholder: T | null = null;

        // Clone of the current element that is following the cursor (portal)
        let clone: T | null = null;

        // The original display style of the element
        // When the element is being dragged, the display style is set to none
        // It will be set back to the original value when the element is not being dragged anymore
        const originalElementDisplay = current.style.display;

        // The canvas used to visualize the strategy of the collision detection (debugging purpose)
        let collisionVisualizerCanvas: HTMLCanvasElement | null = null;

        // The context of the drag and drop that the dragged element is in
        const findContext = (element: Element): Element | null => {
            const context = element.getAttribute(contextConstants.dataAttribute.dragDropContext);

            if (context) {
                return element;
            } else {
                const parent = element.parentElement;

                if (parent) {
                    return findContext(parent);
                } else {
                    return null;
                }
            }
        };

        const context = findContext(current);

        if (!context) {
            return console.warn(
                `Cannot find context for Draggable with ID: ${id} and type: ${type}. It could happen maybe because the Context is not mounted yet or that you forgot to add the Context component.`
            );
        }

        /**
         * @description
         * Handle when user is dragging an element
         *
         * @param e a mouse or touch event
         */
        const onDragMove = (e: MouseEvent | TouchEvent) => {
            e.preventDefault();
            if (!current) return;

            const { top, left } = current.getBoundingClientRect();

            if (e instanceof MouseEvent) {
                clientX = e.clientX;
                clientY = e.clientY;
            } else if (e instanceof TouchEvent) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }

            // check if card is being moved
            if (!hasMove && (Math.abs(clientX - originalCursorPos.current.x) > activatorDistance || Math.abs(clientY - originalCursorPos.current.y) > activatorDistance)) {
                hasMove = true;
                setIsDragging(true);

                if (useClone && ref.current) {
                    const { width, height, left, top } = ref.current.getBoundingClientRect();

                    const transformX = clientX - (clientX - left);
                    const transformY = clientY - (clientY - top);

                    // create a clone of the element (portal)
                    clone = ref.current.cloneNode(true) as T;

                    clone.style.position = "fixed";
                    clone.style.top = `0px`;
                    clone.style.left = `0px`;
                    clone.style.width = `${width}px`;
                    clone.style.height = `${height}px`;
                    clone.style.zIndex = "9999";
                    clone.style.transform = `translate(${transformX}px, ${transformY}px)`;
                    clone.style.transition = "none";

                    document.body.appendChild(clone);
                }

                const startEvent = new CustomEvent<DragStartEvent>(contextConstants.events.dragStart, {
                    detail: {
                        dragged: {
                            id,
                            type,
                        },
                    },
                });

                context.dispatchEvent(startEvent);
            }

            if (!offsetX) offsetX = clientX - left;
            if (!offsetY) offsetY = clientY - top;

            const transformX = clientX - offsetX;
            const transformY = clientY - offsetY;

            if (clone) {
                clone.style.transform = `translate(${transformX}px, ${transformY}px)`;
            }
        };

        type Hovered = {
            element: Element;
            type: HoveredType;
            locations: HoveredLocation[];
            distance: number;
        };

        enum HoveredLocation {
            Top,
            Bottom,
            Left,
            Right,
        }

        // List of droppable elements that the dragged element is hovering over
        enum HoveredType {
            None,
            Droppable,
            Children, // only used when the droppable is sortable
        }

        // An interval to check if the cursor or touch is hovering over a droppable or its children (if it was a sortable)
        let hoverCheckInterval: NodeJS.Timeout | null = null;

        // The element which is being hovered
        let lastHovered: Hovered | null = null;

        /**
         * @description
         * Handle when the cursor is hovering over a droppable or its children (if it was a sortable) while dragging an element
         */
        const handleHoverCheck = () => {
            if (!current) return;

            const getHoveredElement = (elements: Element[], elementType: HoveredType): Hovered | null => {
                let ctx: CanvasRenderingContext2D | null = null;

                if (visualizeCollision) {
                    if (!collisionVisualizerCanvas) {
                        collisionVisualizerCanvas = document.createElement("canvas");
                        collisionVisualizerCanvas.width = window.innerWidth;
                        collisionVisualizerCanvas.height = window.innerHeight;
                        collisionVisualizerCanvas.style.position = "fixed";
                        collisionVisualizerCanvas.style.top = "0";
                        collisionVisualizerCanvas.style.left = "0";
                        collisionVisualizerCanvas.style.zIndex = "9999";
                        collisionVisualizerCanvas.style.pointerEvents = "none";
                        collisionVisualizerCanvas.style.transition = "none";

                        ctx = collisionVisualizerCanvas.getContext("2d");

                        document.body.appendChild(collisionVisualizerCanvas);
                    } else {
                        ctx = collisionVisualizerCanvas.getContext("2d");
                    }

                    if (collisionVisualizerCanvas && ctx && clone) {
                        ctx.clearRect(0, 0, collisionVisualizerCanvas.width, collisionVisualizerCanvas.height);
                        console.clear();

                        let i = 1;

                        for (const element of elements) {
                            if (element.clientWidth === 0 && element.clientHeight === 0) continue;

                            const { top, left, bottom, right } = element.getBoundingClientRect();
                            const { top: Ctop, bottom: Cbottom, left: Cleft, right: Cright } = clone.getBoundingClientRect();

                            ctx.strokeStyle = `red`;
                            ctx.fillStyle = `white`;
                            ctx.lineWidth = 2;
                            ctx.font = "30px Arial";

                            const createSplitLine = () => {
                                if (!collisionVisualizerCanvas || !ctx) return;

                                ctx.strokeStyle = `yellow`;
                                // create a line that split the hovered element into 4 parts
                                ctx.beginPath();
                                ctx.moveTo(left, top + (bottom - top) / 2);
                                ctx.lineTo(right, top + (bottom - top) / 2);
                                ctx.stroke();

                                ctx.beginPath();
                                ctx.moveTo(left + (right - left) / 2, top);
                                ctx.lineTo(left + (right - left) / 2, bottom);
                                ctx.stroke();
                            };

                            const topLeftCornerToTopLeftCorner = Math.sqrt(Math.pow(Cleft - left, 2) + Math.pow(Ctop - top, 2));
                            const topRightCornerToTopRightCorner = Math.sqrt(Math.pow(Cright - right, 2) + Math.pow(Ctop - top, 2));
                            const bottomLeftCornerToBottomLeftCorner = Math.sqrt(Math.pow(Cleft - left, 2) + Math.pow(Cbottom - bottom, 2));
                            const bottomRightCornerToBottomRightCorner = Math.sqrt(Math.pow(Cright - right, 2) + Math.pow(Cbottom - bottom, 2));

                            const topLeftCornerToCenter = Math.sqrt(Math.pow(Cleft - (left + (right - left) / 2), 2) + Math.pow(Ctop - (top + (bottom - top) / 2), 2));
                            const topRightCornerToCenter = Math.sqrt(Math.pow(Cright - (left + (right - left) / 2), 2) + Math.pow(Ctop - (top + (bottom - top) / 2), 2));
                            const bottomLeftCornerToCenter = Math.sqrt(Math.pow(Cleft - (left + (right - left) / 2), 2) + Math.pow(Cbottom - (top + (bottom - top) / 2), 2));
                            const bottomRightCornerToCenter = Math.sqrt(Math.pow(Cright - (left + (right - left) / 2), 2) + Math.pow(Cbottom - (top + (bottom - top) / 2), 2));

                            // create a line between the edges of the hovered element and the dragged element
                            ctx.beginPath();
                            ctx.moveTo(Cleft, Ctop);
                            ctx.lineTo(left, top);
                            ctx.stroke();

                            ctx.beginPath();
                            ctx.moveTo(Cright, Ctop);
                            ctx.lineTo(right, top);
                            ctx.stroke();

                            ctx.beginPath();
                            ctx.moveTo(Cleft, Cbottom);
                            ctx.lineTo(left, bottom);
                            ctx.stroke();

                            ctx.beginPath();
                            ctx.moveTo(Cright, Cbottom);
                            ctx.lineTo(right, bottom);
                            ctx.stroke();

                            // write a text contain length of the line
                            // top left corner to top right corner
                            ctx.fillText(`${Math.round(topLeftCornerToTopLeftCorner)}`, left, top);

                            // top right corner to bottom right corner
                            ctx.fillText(`${Math.round(topRightCornerToTopRightCorner)}`, right, top);

                            // bottom left corner to bottom right corner
                            ctx.fillText(`${Math.round(bottomLeftCornerToBottomLeftCorner)}`, left, bottom);

                            // bottom right corner to top left corner
                            ctx.fillText(`${Math.round(bottomRightCornerToBottomRightCorner)}`, right, bottom);

                            // create a line between the corners of the dragged element into the center of the hovered element
                            ctx.beginPath();
                            ctx.moveTo(Cleft, Ctop);
                            ctx.lineTo(left + (right - left) / 2, top + (bottom - top) / 2);
                            ctx.stroke();

                            ctx.beginPath();
                            ctx.moveTo(Cright, Ctop);
                            ctx.lineTo(left + (right - left) / 2, top + (bottom - top) / 2);
                            ctx.stroke();

                            ctx.beginPath();
                            ctx.moveTo(Cleft, Cbottom);
                            ctx.lineTo(left + (right - left) / 2, top + (bottom - top) / 2);
                            ctx.stroke();

                            ctx.beginPath();
                            ctx.moveTo(Cright, Cbottom);
                            ctx.lineTo(left + (right - left) / 2, top + (bottom - top) / 2);
                            ctx.stroke();

                            // write a text contain length of the line
                            // top left corner to center
                            ctx.fillText(
                                `${Math.round(topLeftCornerToCenter)}`, //
                                left + (right - left) / 4,
                                top + (bottom - top) / 4
                            );

                            // top right corner to center
                            ctx.fillText(
                                `${Math.round(topRightCornerToCenter)}`, //
                                right - (right - left) / 3,
                                top + (bottom - top) / 4
                            );

                            // bottom left corner to center
                            ctx.fillText(
                                `${Math.round(bottomLeftCornerToCenter)}`, //
                                left + (right - left) / 4,
                                bottom - (bottom - top) / 4
                            );

                            // bottom right corner to center
                            ctx.fillText(
                                `${Math.round(bottomRightCornerToCenter)}`, //
                                right - (right - left) / 3,
                                bottom - (bottom - top) / 4
                            );

                            // total length
                            ctx.fillText(
                                `${Math.round(
                                    topLeftCornerToTopLeftCorner +
                                        topRightCornerToTopRightCorner +
                                        bottomLeftCornerToBottomLeftCorner +
                                        bottomRightCornerToBottomRightCorner +
                                        topLeftCornerToCenter +
                                        topRightCornerToCenter +
                                        bottomLeftCornerToCenter +
                                        bottomRightCornerToCenter
                                )}`,
                                left + (right - left) / 2,
                                top + (bottom - top) / 2
                            );

                            createSplitLine();

                            console.log(`Element ${i} is hovered`);

                            // log if the dragged element is on the right or left side of the hovered element
                            if (Cleft < left + (right - left) / 2) {
                                console.log(`Element ${i} is on the left side`);
                            } else {
                                console.log(`Element ${i} is on the right side`);
                            }

                            // log if the dragged element is on the top or bottom side of the hovered element
                            if (Ctop < top + (bottom - top) / 2) {
                                console.log(`Element ${i} is on the top side`);
                            } else {
                                console.log(`Element ${i} is on the bottom side`);
                            }

                            // log if the dragged element is on the top left, top right, bottom left or bottom right side of the hovered element
                            if (Cleft < left + (right - left) / 2 && Ctop < top + (bottom - top) / 2) {
                                console.log(`Element ${i} is on the top left side`);
                            } else if (Cleft > left + (right - left) / 2 && Ctop < top + (bottom - top) / 2) {
                                console.log(`Element ${i} is on the top right side`);
                            } else if (Cleft < left + (right - left) / 2 && Ctop > top + (bottom - top) / 2) {
                                console.log(`Element ${i} is on the bottom left side`);
                            } else if (Cleft > left + (right - left) / 2 && Ctop > top + (bottom - top) / 2) {
                                console.log(`Element ${i} is on the bottom right side`);
                            }

                            i++;
                        }
                    }
                }

                const hovered = elements.reduce((prevResult, element) => {
                    if (!clone) return prevResult;
                    if (element.clientWidth === 0 && element.clientHeight === 0) return prevResult;

                    const { top: Ctop, bottom: Cbottom, left: Cleft, right: Cright } = clone.getBoundingClientRect();
                    const { top, left, bottom, right } = element.getBoundingClientRect();

                    const acceptList = element.getAttribute(droppableConstants.dataAttribute.accepts);
                    const isAccepted = !acceptList || acceptList === "" || acceptList.split(",").includes(type);

                    if (isAccepted) {
                        const topLeftCornerToTopLeftCorner = Math.sqrt(Math.pow(Cleft - left, 2) + Math.pow(Ctop - top, 2));
                        const topRightCornerToTopRightCorner = Math.sqrt(Math.pow(Cright - right, 2) + Math.pow(Ctop - top, 2));
                        const bottomLeftCornerToBottomLeftCorner = Math.sqrt(Math.pow(Cleft - left, 2) + Math.pow(Cbottom - bottom, 2));
                        const bottomRightCornerToBottomRightCorner = Math.sqrt(Math.pow(Cright - right, 2) + Math.pow(Cbottom - bottom, 2));

                        const topLeftCornerToCenter = Math.sqrt(Math.pow(Cleft - (left + (right - left) / 2), 2) + Math.pow(Ctop - (top + (bottom - top) / 2), 2));
                        const topRightCornerToCenter = Math.sqrt(Math.pow(Cright - (left + (right - left) / 2), 2) + Math.pow(Ctop - (top + (bottom - top) / 2), 2));
                        const bottomLeftCornerToCenter = Math.sqrt(Math.pow(Cleft - (left + (right - left) / 2), 2) + Math.pow(Cbottom - (top + (bottom - top) / 2), 2));
                        const bottomRightCornerToCenter = Math.sqrt(Math.pow(Cright - (left + (right - left) / 2), 2) + Math.pow(Cbottom - (top + (bottom - top) / 2), 2));

                        const totalDistance =
                            topLeftCornerToTopLeftCorner +
                            topRightCornerToTopRightCorner +
                            bottomLeftCornerToBottomLeftCorner +
                            bottomRightCornerToBottomRightCorner +
                            topLeftCornerToCenter +
                            topRightCornerToCenter +
                            bottomLeftCornerToCenter +
                            bottomRightCornerToCenter;

                        if (prevResult && prevResult.distance < totalDistance) {
                            return prevResult;
                        }

                        let locations: HoveredLocation[] = [];

                        if (Cleft < left + (right - left) / 2 && Ctop < top + (bottom - top) / 2) {
                            locations.push(HoveredLocation.Top, HoveredLocation.Left);
                        } else if (Cleft > left + (right - left) / 2 && Ctop < top + (bottom - top) / 2) {
                            locations.push(HoveredLocation.Top, HoveredLocation.Right);
                        } else if (Cleft < left + (right - left) / 2 && Ctop > top + (bottom - top) / 2) {
                            locations.push(HoveredLocation.Bottom, HoveredLocation.Left);
                        } else if (Cleft > left + (right - left) / 2 && Ctop > top + (bottom - top) / 2) {
                            locations.push(HoveredLocation.Bottom, HoveredLocation.Right);
                        }

                        return {
                            element,
                            distance: totalDistance,
                            type: elementType,
                            locations,
                        };
                    }

                    return prevResult;
                }, null as Hovered | null);

                if (hovered) {
                    const isSortable = !!hovered.element.getAttribute(droppableConstants.dataAttribute.sortable);

                    const droppableChilds = hovered.element.querySelectorAll(`[${droppableConstants.dataAttribute.droppable}]`);

                    if (droppableChilds.length > 0) {
                        const droppableInside = getHoveredElement(Array.from(droppableChilds), HoveredType.Droppable);

                        if (droppableInside) {
                            return droppableInside;
                        }
                    }

                    const childs = isSortable ? hovered.element.children : [];

                    if (childs.length > 0) {
                        const childrenInside = getHoveredElement(Array.from(childs), HoveredType.Children);

                        if (childrenInside) {
                            return childrenInside;
                        }
                    }

                    return hovered;
                } else {
                    return null;
                }
            };

            hoverCheckInterval = setInterval(() => {
                if (!hasMove || !current) return;

                // Find all droppable elements inside the context
                const allDroppableElements = context.querySelectorAll(`[${droppableConstants.dataAttribute.droppable}]`);

                // Get the hovered element
                const hovered = getHoveredElement(Array.from(allDroppableElements), HoveredType.Droppable);

                if (hovered && hovered.element !== current && hovered.element !== clone && hovered.element !== placeholder) {
                    const isLastHoveredLocationSame = lastHovered && hovered.locations.every((location, index) => lastHovered && location === lastHovered.locations[index]);

                    if (!lastHovered || hovered.element !== lastHovered.element || !isLastHoveredLocationSame) {
                        if (lastHovered) {
                            const container = lastHovered.type === HoveredType.Droppable ? lastHovered.element : lastHovered.element.parentElement;
                            if (!container) return;

                            const isContainerSortable = !!container.getAttribute(droppableConstants.dataAttribute.sortable);

                            const leaveEvent = new CustomEvent<DragLeaveEvent>(contextConstants.events.dragLeave, {
                                detail: {
                                    dragged: {
                                        id,
                                        type,
                                    },
                                    dropped: {
                                        id: container.getAttribute(droppableConstants.dataAttribute.droppableId) as string,
                                        sortable: isContainerSortable,
                                        index: -1,
                                    },
                                },
                            });

                            context.dispatchEvent(leaveEvent);
                            container.dispatchEvent(leaveEvent);
                        }

                        lastHovered = hovered;

                        const container = hovered.type === HoveredType.Droppable ? hovered.element : hovered.element.parentElement;
                        if (!container) return;

                        const isContainerSortable = !!container.getAttribute(droppableConstants.dataAttribute.sortable);
                        let newIndex = -1;
                        let isPrepend = false;

                        if (isContainerSortable) {
                            const sortableDirection = container.getAttribute(droppableConstants.dataAttribute.sortableDirection) as SortableDirection;

                            switch (sortableDirection) {
                                case SortableDirection.Vertical:
                                    isPrepend = hovered.locations.includes(HoveredLocation.Top);
                                    break;

                                case SortableDirection.Horizontal:
                                    isPrepend = hovered.locations.includes(HoveredLocation.Left);
                                    break;

                                case SortableDirection.Auto:
                                    isPrepend = hovered.locations.includes(HoveredLocation.Top) || hovered.locations.includes(HoveredLocation.Left);
                                    break;

                                default:
                                    isPrepend = false;
                                    break;
                            }

                            if (!placeholder) {
                                placeholder = current.cloneNode(true) as T;
                                current.style.display = "none";
                            }

                            if (hovered.type === HoveredType.Droppable) {
                                if (isPrepend) {
                                    hovered.element.prepend(placeholder);
                                    newIndex = 0;
                                } else {
                                    hovered.element.append(placeholder);
                                    newIndex = Array.from(container.children).filter((child) => child !== placeholder && child !== clone && child !== current).length;
                                }
                            } else if (hovered.type === HoveredType.Children) {
                                newIndex = Array.from(container.children)
                                    .filter((child) => child !== placeholder && child !== clone && child !== current)
                                    .indexOf(hovered.element);

                                if (isPrepend) {
                                    hovered.element.before(placeholder);
                                } else {
                                    hovered.element.after(placeholder);
                                    newIndex += 1;
                                }
                            }
                        }

                        const enterEvent = new CustomEvent<DragEnterEvent>(contextConstants.events.dragEnter, {
                            detail: {
                                dragged: {
                                    id,
                                    type,
                                },
                                dropped: {
                                    id: container.getAttribute(droppableConstants.dataAttribute.droppableId) as string,
                                    sortable: isContainerSortable,
                                    index: newIndex,
                                },
                            },
                        });

                        context.dispatchEvent(enterEvent);
                        container.dispatchEvent(enterEvent);
                    }
                } else if (!hovered && lastHovered) {
                    const container = lastHovered.type === HoveredType.Droppable ? lastHovered.element : lastHovered.element.parentElement;
                    if (!container) return;

                    const isContainerSortable = !!container.getAttribute(droppableConstants.dataAttribute.sortable);

                    if (!isContainerSortable) {
                        lastHovered = null;

                        const leaveEvent = new CustomEvent<DragLeaveEvent>(contextConstants.events.dragLeave, {
                            detail: {
                                dragged: {
                                    id,
                                    type,
                                },
                                dropped: {
                                    id: container.getAttribute(droppableConstants.dataAttribute.droppableId) as string,
                                    sortable: isContainerSortable,
                                    index: -1,
                                },
                            },
                        });

                        context.dispatchEvent(leaveEvent);
                        container.dispatchEvent(leaveEvent);
                    }
                }
            }, 100);
        };

        // handle auto scroll when dragging
        let scrollContainerFindInterval: NodeJS.Timer | null = null;
        let autoContainerScrollIntervals: NodeJS.Timer | null = null;

        const handleAutoContainerScroll = () => {
            const getScrollableElements = () => {
                let scrollableElements = document.getElementsByTagName("*");
                let registeredScrollableElements: Element[] = [];

                // get all scrollable elements
                for (let i = 0; i < scrollableElements.length; i++) {
                    if (scrollableElements[i].scrollHeight > scrollableElements[i].clientHeight) {
                        registeredScrollableElements.push(scrollableElements[i]);
                    }

                    if (scrollableElements[i].scrollWidth > scrollableElements[i].clientWidth) {
                        registeredScrollableElements.push(scrollableElements[i]);
                    }
                }

                return registeredScrollableElements;
            };

            // clear all intervals
            if (scrollContainerFindInterval) {
                clearInterval(scrollContainerFindInterval);
            }

            if (autoContainerScrollIntervals) {
                clearInterval(autoContainerScrollIntervals);
            }

            // get all scrollable elements
            let scrollableElements = getScrollableElements();

            scrollContainerFindInterval = setInterval(() => {
                scrollableElements = getScrollableElements();
            }, 500);

            // register new intervals
            autoContainerScrollIntervals = setInterval(() => {
                scrollableElements.forEach((element) => {
                    if (!hasMove) return;
                    const { top, left, width, height } = element.getBoundingClientRect();

                    // check if element has vertical scroll
                    if (element.scrollHeight > element.clientHeight) {
                        const partitionSizeToTop = height / 2;

                        if (clientY <= partitionSizeToTop && clientX > left && clientX < left + width) {
                            const speed = Math.abs(clientY - partitionSizeToTop) / 10;
                            const actualSpeed = speed > 15 ? (clientY < 0 ? 25 : 15) : speed;
                            element.scrollTop -= actualSpeed;
                        }

                        const partitionSizeToBottom = height / 4;

                        if (height - clientY < partitionSizeToBottom && clientX > left && clientX < left + width) {
                            const speed = Math.abs(height - clientY - partitionSizeToBottom) / 10;
                            const actualSpeed = speed > 15 ? (clientY > height ? 25 : 15) : speed;
                            element.scrollTop += actualSpeed;
                        }
                    }

                    // check if element has horizontal scroll
                    if (element.scrollWidth > element.clientWidth) {
                        const partitionSize = width / 4;

                        if (clientX <= partitionSize && clientY > top && clientY < top + height) {
                            const speed = Math.abs(clientX - partitionSize) / 10;
                            const actualSpeed = speed > 15 ? (clientX < 0 ? 25 : 15) : speed;
                            element.scrollLeft -= actualSpeed;
                        }

                        if (width - clientX < partitionSize && clientY > top && clientY < top + height) {
                            const speed = Math.abs(width - clientX - partitionSize) / 10;
                            const actualSpeed = speed > 15 ? (clientX > width ? 25 : 15) : speed;
                            element.scrollLeft += actualSpeed;
                        }
                    }
                });
            }, 10);
        };

        if (hasStartDragging) {
            window.addEventListener("mousemove", onDragMove);
            window.addEventListener("mouseup", onDragEnd);
            window.addEventListener("touchmove", onDragMove);
            window.addEventListener("touchend", onDragEnd);

            handleAutoContainerScroll();
            handleHoverCheck();
        }

        return () => {
            if (collisionVisualizerCanvas) collisionVisualizerCanvas.remove();

            window.removeEventListener("mousemove", onDragMove);
            window.removeEventListener("mouseup", onDragEnd);
            window.removeEventListener("touchmove", onDragMove);
            window.removeEventListener("touchend", onDragEnd);

            if (hoverCheckInterval) {
                clearInterval(hoverCheckInterval);
            }

            if (scrollContainerFindInterval) {
                clearInterval(scrollContainerFindInterval);
            }

            if (autoContainerScrollIntervals) {
                clearInterval(autoContainerScrollIntervals);
            }

            if (isDragging) {
                let originX = 0;
                let originY = 0;

                if (placeholder) {
                    const { x, y } = placeholder.getBoundingClientRect();
                    originX = x;
                    originY = y;

                    placeholder.remove();
                } else {
                    const { x, y } = current.getBoundingClientRect();
                    originX = x;
                    originY = y;
                }

                if (clone) {
                    const time = 200;
                    clone.style.transition = `transform ${time}ms ease-in-out`;
                    clone.style.transform = `translate(${originX}px, ${originY}px)`;

                    setTimeout(() => {
                        if (clone) {
                            clone.remove();
                        }

                        setIsDragging(false);
                    }, time);
                }
            } else {
                if (placeholder) {
                    placeholder.remove();
                }

                if (clone) {
                    clone.remove();
                }
            }

            current.style.display = originalElementDisplay;

            if (lastHovered) {
                const container = lastHovered.type === HoveredType.Children ? lastHovered.element.parentElement : lastHovered.element;
                if (!container) return;

                const sortableDirection = container.getAttribute(droppableConstants.dataAttribute.sortableDirection) as SortableDirection;

                let newIndex = -1;
                let isPrepend: boolean;

                switch (sortableDirection) {
                    case SortableDirection.Vertical:
                        isPrepend = lastHovered.locations.includes(HoveredLocation.Top);
                        break;

                    case SortableDirection.Horizontal:
                        isPrepend = lastHovered.locations.includes(HoveredLocation.Left);
                        break;

                    case SortableDirection.Auto:
                        isPrepend = lastHovered.locations.includes(HoveredLocation.Top) || lastHovered.locations.includes(HoveredLocation.Left);
                        break;

                    default:
                        isPrepend = false;
                        break;
                }

                if (lastHovered.type === HoveredType.Children) {
                    newIndex = Array.from(container.children)
                        .filter((child) => child !== placeholder && child !== clone && child !== current)
                        .indexOf(lastHovered.element);

                    // If the last hovered element area is on bottom, we need to add 1 to the index
                    // since we are inserting the element after the last hovered element
                    if (!isPrepend) {
                        newIndex += 1;
                    }
                } else if (lastHovered.type === HoveredType.Droppable) {
                    if (isPrepend) {
                        newIndex = 0;
                    } else {
                        newIndex = Array.from(container.children).filter((child) => child !== placeholder && child !== clone && child !== current).length;
                    }
                }

                const endEvent = new CustomEvent<DragEndEvent>(contextConstants.events.dragEnd, {
                    detail: {
                        dragged: {
                            id,
                            type,
                        },
                        dropped: {
                            id: container.getAttribute(droppableConstants.dataAttribute.droppableId) as string,
                            sortable: !!container.getAttribute(droppableConstants.dataAttribute.sortable),
                            index: newIndex,
                        },
                    },
                });

                context.dispatchEvent(endEvent);
                container.dispatchEvent(endEvent);
            } else {
                const cancelEvent = new CustomEvent<DragCancelEvent>(contextConstants.events.dragCancel, {
                    detail: {
                        dragged: {
                            id,
                            type,
                        },
                    },
                });

                context.dispatchEvent(cancelEvent);
            }
        };
    }, [hasStartDragging, id, onDragEnd, type, useClone, activatorDistance, isDragging, visualizeCollision]);

    return {
        ref,
        handleRef,
        isDragging,
        onClick,
        onTouch,
        onClickOrTouch,
    };
}
