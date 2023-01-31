import { constants as contextConstants } from "@/lib/hooks/drag-and-drop/use-drag-drop-context";
import { SortableDirection, constants as droppableConstants } from "@/lib/hooks/drag-and-drop/use-droppable";

import { useCallback, useRef, useState, useEffect } from "react";

export type useDraggableOptions = {
    id: string;
    type: string;
    useClone?: boolean;
    activatorDistance?: number;
};

export const constants = {
    dataAttribute: {
        draggable: "data-draggable",
        draggableId: "data-draggable-id",
        draggableType: "data-draggable-type",
    },
};

export default function useDraggable<T extends HTMLElement = HTMLDivElement>({ id, type, useClone = true, activatorDistance = 10 }: useDraggableOptions) {
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

            if (!isDragging) {
                // if the element is not being dragged, then it's a click
                ref.current?.onclick?.(e as MouseEvent);
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

        // The context of the drag and drop that the dragged element is in
        let context: Element | null = null;

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
            }

            if (!offsetX) offsetX = clientX - left;
            if (!offsetY) offsetY = clientY - top;

            const transformX = clientX - offsetX;
            const transformY = clientY - offsetY;

            if (clone) {
                clone.style.transform = `translate(${transformX}px, ${transformY}px)`;
            }
        };

        // List of droppable elements that the dragged element is hovering over
        enum HoveredType {
            None,
            Droppable,
            Children, // only used when the droppable is sortable
        }

        // An interval to check if the cursor or touch is hovering over a droppable or its children (if it was a sortable)
        let hoverCheckInterval: NodeJS.Timeout | null = null;

        // The element which is being hovered
        let lastHoveredElement: Element | null = null;

        // The type of the hovered element
        let lastHoveredType: HoveredType = HoveredType.None;

        // Is the hover area of the hovered element on top?
        let isLastHoverAreaOnTop = false;

        // Is the hover area of the hovered element on left?
        let isLastHoverAreaOnLeft = false;

        /**
         * @description
         * Handle when the cursor is hovering over a droppable or its children (if it was a sortable) while dragging an element
         */
        const handleHoverCheck = () => {
            if (!current) return;

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

            const getHoveredElement = (elements: Element[], elementType: HoveredType): [Element, HoveredType] | [null, HoveredType.None] => {
                const hovered = elements.find((element) => {
                    const { top, left, bottom, right } = element.getBoundingClientRect();

                    const acceptList = element.getAttribute(droppableConstants.dataAttribute.accepts);
                    const accepts = !acceptList || acceptList === "" || acceptList.split(",").includes(type);

                    return accepts && clientX > left && clientX < right && clientY > top && clientY < bottom;
                });

                if (hovered) {
                    const isSortable = !!hovered.getAttribute(droppableConstants.dataAttribute.sortable);

                    const droppableChilds = hovered.querySelectorAll(`[${droppableConstants.dataAttribute.droppable}]`);

                    if (droppableChilds.length > 0) {
                        const droppableInside = getHoveredElement(Array.from(droppableChilds), HoveredType.Droppable);

                        if (droppableInside[0] !== null) {
                            return droppableInside;
                        }
                    }

                    const childs = isSortable ? hovered.children : [];

                    if (childs.length > 0) {
                        const childrenInside = getHoveredElement(Array.from(childs), HoveredType.Children);

                        if (childrenInside[0] !== null) {
                            return childrenInside;
                        }
                    }

                    return [hovered, elementType];
                } else {
                    return [null, HoveredType.None];
                }
            };

            hoverCheckInterval = setInterval(() => {
                if (!hasMove || !current) return;

                // Get near element with data-drag-drop-context, if not found, log an error
                context = findContext(current);
                if (!context) return console.error("No drag and drop context found");

                // Find all droppable elements inside the context
                const allDroppableElements = context.querySelectorAll(`[${droppableConstants.dataAttribute.droppable}]`);

                // Get the hovered element
                const [hoveredElement, elementType] = getHoveredElement(Array.from(allDroppableElements), HoveredType.Droppable);

                if (hoveredElement && hoveredElement !== current && hoveredElement !== clone && hoveredElement !== placeholder) {
                    const { top, bottom, left, right } = hoveredElement.getBoundingClientRect();

                    const isOnTop = clientY < top + (bottom - top) / 2;
                    const isOnLeft = clientX < left + (right - left) / 2;

                    if (hoveredElement !== lastHoveredElement || isLastHoverAreaOnTop !== isOnTop || isLastHoverAreaOnLeft !== isOnLeft) {
                        lastHoveredElement = hoveredElement;
                        lastHoveredType = elementType;
                        isLastHoverAreaOnTop = isOnTop;
                        isLastHoverAreaOnLeft = isOnLeft;

                        const container = elementType === HoveredType.Droppable ? hoveredElement : (hoveredElement.parentElement as HTMLElement);
                        const isContainerSortable = !!container.getAttribute(droppableConstants.dataAttribute.sortable);

                        if (isContainerSortable) {
                            const sortableDirection = container.getAttribute(droppableConstants.dataAttribute.sortableDirection) as SortableDirection;
                            const prepend = (sortableDirection === SortableDirection.Vertical && isOnTop) || (sortableDirection === SortableDirection.Horizontal && isOnLeft);

                            if (!placeholder) {
                                placeholder = current.cloneNode(true) as T;
                                current.style.display = "none";
                            }

                            if (elementType === HoveredType.Droppable) {
                                if (prepend) {
                                    hoveredElement.prepend(placeholder);
                                } else {
                                    hoveredElement.append(placeholder);
                                }
                            } else if (elementType === HoveredType.Children) {
                                if (prepend) {
                                    hoveredElement.before(placeholder);
                                } else {
                                    hoveredElement.after(placeholder);
                                }
                            }
                        }
                    }
                } else if (!hoveredElement && lastHoveredElement) {
                    lastHoveredElement = null;
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

            if (clone) {
                if (isDragging) {
                    let originX = 0;
                    let originY = 0;

                    if (placeholder) {
                        const { x, y } = placeholder.getBoundingClientRect();
                        originX = x;
                        originY = y;
                    } else {
                        const { x, y } = current.getBoundingClientRect();
                        originX = x;
                        originY = y;
                    }

                    clone.style.transition = "transform 0.2s ease-in-out";
                    clone.style.transform = `translate(${originX}px, ${originY}px)`;

                    const onTransitionEnd = () => {
                        clone?.removeEventListener("transitionend", onTransitionEnd);
                        clone?.remove();
                        clone = null;
                    };

                    clone.addEventListener("transitionend", onTransitionEnd);
                } else {
                    clone.remove();
                    clone = null;
                }
            }

            if (placeholder) {
                placeholder.remove();
                placeholder = null;
            }

            current.style.display = originalElementDisplay;
            setIsDragging(false);
        };
    }, [hasStartDragging, id, onDragEnd, type, useClone, activatorDistance, isDragging]);

    return {
        ref,
        handleRef,
        isDragging,
    };
}
