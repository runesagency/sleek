import { SortableDirection } from "@/lib/hooks/drag-and-drop/use-droppable";

import { useCallback, useRef, useState, useEffect } from "react";

export type useDraggableOptions = {
    type: string;
    useClone?: boolean;
};

export default function useDraggable<T extends HTMLElement = HTMLDivElement>({ type, useClone = true }: useDraggableOptions) {
    const ref = useRef<T>(null);
    const handleRef = useRef<T>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [originalCursorPos, setOriginalCursorPos] = useState({ x: 0, y: 0 });

    const [clone, setClone] = useState<T | null>(null);

    const dragStartTimeout = useRef<number | null>(null);

    const onDragStart = useCallback(
        (e: MouseEvent | TouchEvent) => {
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

            setOriginalCursorPos({ x: clientX, y: clientY });

            dragStartTimeout.current = window.setTimeout(() => {
                setIsDragging(true);

                if (useClone && ref.current) {
                    const { width, height, left, top } = ref.current.getBoundingClientRect();

                    const transformX = clientX - (clientX - left);
                    const transformY = clientY - (clientY - top);

                    // create a clone of the element (portal)
                    const clone = ref.current?.cloneNode(true) as T;
                    setClone(clone);
                    document.body.appendChild(clone);

                    clone.style.position = "fixed";
                    clone.style.top = `0px`;
                    clone.style.left = `0px`;
                    clone.style.width = `${width}px`;
                    clone.style.height = `${height}px`;
                    clone.style.zIndex = "9999";
                    clone.style.transform = `translate(${transformX}px, ${transformY}px)`;
                }
            }, 100);
        },
        [useClone]
    );

    const onDragEnd = useCallback(
        (e: MouseEvent | TouchEvent) => {
            e.preventDefault();

            if (clone) clone.remove();

            if (dragStartTimeout.current) {
                if (!isDragging) {
                    // if the element is not being dragged, then it's a click
                    ref.current?.onclick?.(e as MouseEvent);
                }

                clearTimeout(dragStartTimeout.current);
            }

            setIsDragging(false);
        },
        [clone, isDragging]
    );

    useEffect(() => {
        const current = ref.current;
        const handleCurrent = handleRef.current;

        if (current) {
            current.dataset.draggable = "true";
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
    }, [onDragStart, onDragEnd, ref]);

    useEffect(() => {
        const current = ref.current;
        if (!current) return;

        let clientX = 0;
        let clientY = 0;

        let offsetX = 0;
        let offsetY = 0;

        let clonePreviewElement: T | null = null;
        let hasMove = false;
        let currentElementOriginalDisplay = current.style.display;

        // handle clone movement and other stuff
        const onDragMove = (e: MouseEvent | TouchEvent) => {
            e.preventDefault();
            if (!current || !clone) return;

            const { top, left } = current.getBoundingClientRect();

            if (e instanceof MouseEvent) {
                clientX = e.clientX;
                clientY = e.clientY;
            } else if (e instanceof TouchEvent) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }

            // check if card is being moved
            if (!hasMove && (Math.abs(clientX - originalCursorPos.x) > 10 || Math.abs(clientY - originalCursorPos.y) > 10)) {
                hasMove = true;
            }

            if (!offsetX) offsetX = clientX - left;
            if (!offsetY) offsetY = clientY - top;

            const transformX = clientX - offsetX;
            const transformY = clientY - offsetY;

            clone.style.transform = `translate(${transformX}px, ${transformY}px)`;
        };

        // get hovered element recursively until no more droppable or draggable element are found
        let hoverCheckInterval: NodeJS.Timeout | null = null;

        const handleHoverCheck = () => {
            if (!current) return;

            let lastHoveredElement: Element | null = null;
            let isLastHoverAreaOnTop = false;
            let isLastHoverAreaOnLeft = false;

            enum HoveredType {
                None,
                Droppable,
                Children,
            }

            const getHoveredElement = (elements: Element[], elementType: HoveredType): [Element, HoveredType] | [null, HoveredType.None] => {
                const hovered = elements.find((element) => {
                    const { top, left, bottom, right } = element.getBoundingClientRect();

                    const acceptList = element.getAttribute("data-accepts");
                    const accepts = !acceptList || acceptList === "" || acceptList.split(",").includes(type);

                    return accepts && clientX > left && clientX < right && clientY > top && clientY < bottom;
                });

                if (hovered) {
                    const isSortable = hovered.getAttribute("data-sortable") === "true";

                    const droppableChilds = hovered.querySelectorAll("[data-droppable=true]");

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

                const allDroppableElements = document.querySelectorAll("[data-droppable=true]");
                const [hoveredElement, elementType] = getHoveredElement(Array.from(allDroppableElements), HoveredType.Droppable);

                if (hoveredElement && hoveredElement !== current && hoveredElement !== clone && hoveredElement !== clonePreviewElement) {
                    const { top, bottom, left, right } = hoveredElement.getBoundingClientRect();

                    const isOnTop = clientY < top + (bottom - top) / 2;
                    const isOnLeft = clientX < left + (right - left) / 2;

                    if (hoveredElement !== lastHoveredElement || isLastHoverAreaOnTop !== isOnTop || isLastHoverAreaOnLeft !== isOnLeft) {
                        lastHoveredElement = hoveredElement;
                        isLastHoverAreaOnTop = isOnTop;
                        isLastHoverAreaOnLeft = isOnLeft;

                        const container = elementType === HoveredType.Droppable ? hoveredElement : (hoveredElement.parentElement as HTMLElement);
                        const isContainerSortable = container.getAttribute("data-sortable") === "true";

                        if (isContainerSortable) {
                            const sortableDirection = container.getAttribute("data-sortable-direction");
                            const prepend = (sortableDirection === SortableDirection.Vertical && isOnTop) || (sortableDirection === SortableDirection.Horizontal && isOnLeft);

                            if (!clonePreviewElement) {
                                clonePreviewElement = current.cloneNode(true) as T;
                                current.style.display = "none";
                            }

                            if (elementType === HoveredType.Droppable) {
                                if (prepend) {
                                    hoveredElement.prepend(clonePreviewElement);
                                } else {
                                    hoveredElement.append(clonePreviewElement);
                                }
                            } else if (elementType === HoveredType.Children) {
                                if (prepend) {
                                    hoveredElement.before(clonePreviewElement);
                                } else {
                                    hoveredElement.after(clonePreviewElement);
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

        if (isDragging) {
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
                clone.remove();
            }

            if (clonePreviewElement) {
                clonePreviewElement.remove();
                clonePreviewElement = null;
            }

            current.style.display = currentElementOriginalDisplay;
        };
    }, [clone, isDragging, onDragEnd, originalCursorPos.x, originalCursorPos.y, type]);

    return {
        ref,
        handleRef,
        isDragging,
    };
}
