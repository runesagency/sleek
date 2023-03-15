import type { DragCancelEvent, DragEndEvent, DragEnterEvent, DragLeaveEvent, DragStartEvent } from "@/lib/drag-and-drop";

import { SortableDirection, droppableConstants, contextConstants } from "@/lib/drag-and-drop";

import { useCallback, useRef, useState, useEffect } from "react";

export const draggableConstants = {
    dataAttribute: {
        draggable: "data-draggable",
        draggableId: "data-draggable-id",
        draggableType: "data-draggable-type",
    },
};

export type DraggableProvided<T> = {
    ref: React.RefObject<T>;
    handleRef: React.RefObject<T>;
};

export type DraggableSnapshot = {
    isDragging: boolean;
};

export type DraggableProps<T> = {
    id: string;
    type: string;
    useClone?: boolean;
    activatorDistance?: number;
    visualizeCollision?: boolean;
    onClick?: (e: MouseEvent) => void;
    onTouch?: (e: TouchEvent) => void;
    onClickOrTouch?: (e: MouseEvent | TouchEvent) => void;
    children: (provided: DraggableProvided<T>, snapshot: DraggableSnapshot) => JSX.Element;
};

export default function Draggable<T extends HTMLElement>({ id, type, useClone = true, activatorDistance = 10, visualizeCollision, onClick, onTouch, onClickOrTouch, children }: DraggableProps<T>) {
    const ref = useRef<T>(null);
    const handleRef = useRef<T>(null);
    const originalCursorPos = useRef<Record<"x" | "y", number>>({ x: 0, y: 0 });

    // Is the element being dragged?
    const [hasStartDragging, setHasStartDragging] = useState(false);

    // Is the element has been counted as a drag? (After it was moved X pixels)
    const [isDragging, setIsDragging] = useState(false);

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
                    onClick?.(e);
                } else if (e instanceof TouchEvent) {
                    onTouch?.(e);
                }

                onClickOrTouch?.(e);
            }

            setHasStartDragging(false);
            setIsDragging(false);
        },
        [isDragging, onClick, onTouch, onClickOrTouch]
    );

    /**
     * @description
     * Handle component when mounted and unmounted
     */
    useEffect(() => {
        const current = ref.current;
        const handleCurrent = handleRef.current;

        if (current) {
            current.setAttribute(draggableConstants.dataAttribute.draggable, "true");
            current.setAttribute(draggableConstants.dataAttribute.draggableId, id);
            current.setAttribute(draggableConstants.dataAttribute.draggableType, type);

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
                current.removeAttribute(draggableConstants.dataAttribute.draggable);
                current.removeAttribute(draggableConstants.dataAttribute.draggableId);
                current.removeAttribute(draggableConstants.dataAttribute.draggableType);

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

                        // create a line between center of the dragged element and the center of the hovered element
                        for (const element of elements) {
                            if (element.clientWidth === 0 && element.clientHeight === 0) continue;

                            const { top: Ctop, bottom: Cbottom, left: Cleft, right: Cright } = clone.getBoundingClientRect();
                            const { top, left, bottom, right } = element.getBoundingClientRect();

                            const acceptList = element.getAttribute(droppableConstants.dataAttribute.accepts);
                            const isAccepted = !acceptList || acceptList === "" || acceptList.split(",").includes(type);

                            if (isAccepted) {
                                ctx.beginPath();
                                ctx.moveTo(Cleft + (Cright - Cleft) / 2, Ctop + (Cbottom - Ctop) / 2);
                                ctx.lineTo(left + (right - left) / 2, top + (bottom - top) / 2);
                                ctx.stroke();

                                // write a text contain length of the line
                                ctx.fillText(
                                    `${Math.round(
                                        Math.sqrt(Math.pow(Cleft + (Cright - Cleft) / 2 - (left + (right - left) / 2), 2) + Math.pow(Ctop + (Cbottom - Ctop) / 2 - (top + (bottom - top) / 2), 2))
                                    )}`,
                                    left + (right - left) / 2,
                                    top + (bottom - top) / 2
                                );
                            }
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
                        const cloneCenterX = Cleft + (Cright - Cleft) / 2;
                        const hoveredCenterX = left + (right - left) / 2;
                        const cloneCenterY = Ctop + (Cbottom - Ctop) / 2;
                        const hoveredCenterY = top + (bottom - top) / 2;

                        const centerToCenter = Math.sqrt(Math.pow(cloneCenterX - hoveredCenterX, 2) + Math.pow(cloneCenterY - hoveredCenterY, 2));

                        if (prevResult && prevResult.distance < centerToCenter) {
                            return prevResult;
                        }

                        let locations: HoveredLocation[] = [];

                        // find the closest location to the center of the dragged element
                        if (cloneCenterX < hoveredCenterX && cloneCenterY < hoveredCenterY) {
                            locations.push(HoveredLocation.Top, HoveredLocation.Left);
                        } else if (cloneCenterX > hoveredCenterX && cloneCenterY < hoveredCenterY) {
                            locations.push(HoveredLocation.Top, HoveredLocation.Right);
                        } else if (cloneCenterX < hoveredCenterX && cloneCenterY > hoveredCenterY) {
                            locations.push(HoveredLocation.Bottom, HoveredLocation.Left);
                        } else if (cloneCenterX > hoveredCenterX && cloneCenterY > hoveredCenterY) {
                            locations.push(HoveredLocation.Bottom, HoveredLocation.Right);
                        }

                        return {
                            element,
                            distance: centerToCenter,
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
                    if (element.scrollHeight > element.clientHeight && clientY > top && clientY < top + height) {
                        const partitionSize = height / 4;
                        const cursorPos = clientY - top;

                        if (cursorPos <= partitionSize && clientX > left && clientX < left + width) {
                            const speed = Math.abs(cursorPos - partitionSize) / 10;
                            const actualSpeed = speed > 15 ? (clientY < 0 ? 25 : 15) : speed;
                            element.scrollTop -= actualSpeed;
                        }

                        if (height - cursorPos < partitionSize && clientX > left && clientX < left + width) {
                            const speed = Math.abs(height - cursorPos - partitionSize) / 10;
                            const actualSpeed = speed > 15 ? (clientY > height ? 25 : 15) : speed;
                            element.scrollTop += actualSpeed;
                        }
                    }

                    // check if element has horizontal scroll
                    if (element.scrollWidth > element.clientWidth && clientX > left && clientX < left + width) {
                        const partitionSize = width / 4;
                        const cursorPos = clientX - left;

                        if (cursorPos <= partitionSize && clientY > top && clientY < top + height) {
                            const speed = Math.abs(cursorPos - partitionSize) / 10;
                            const actualSpeed = speed > 15 ? (clientX < 0 ? 25 : 15) : speed;
                            element.scrollLeft -= actualSpeed;
                        }

                        if (width - cursorPos < partitionSize && clientY > top && clientY < top + height) {
                            const speed = Math.abs(width - cursorPos - partitionSize) / 10;
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

    return children({ ref, handleRef }, { isDragging });
}
