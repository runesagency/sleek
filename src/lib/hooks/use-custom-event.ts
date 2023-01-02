import { useId } from "@mantine/hooks";
import { useEffect, useMemo, useState } from "react";

/**
 * Dispatch and listen to custom events.
 * @param eventName Event name to listen to
 * @param broadcasted Broadcast the event to other tabs
 */
export default function useCustomEvent<T>(eventName: string, broadcasted = true) {
    const [data, setData] = useState<T | null>(null);
    const broadcast = useMemo(() => new BroadcastChannel(eventName), [eventName]);
    const id = useId();

    type CustomEventDetail = {
        emitId: string;
        data: T;
    };

    useEffect(() => {
        const handler = ((event: CustomEvent<CustomEventDetail>) => {
            if (event.detail.emitId === id) return;
            setData(event.detail.data);
        }) as EventListener;

        window.addEventListener(eventName, handler);

        if (broadcasted) {
            broadcast.onmessage = (event) => {
                setData(event.data);
            };
        }

        return () => {
            window.removeEventListener(eventName, handler);
        };
    }, [broadcast, broadcasted, eventName, id]);

    const emit = (data: T) => {
        const customEvent = new CustomEvent<CustomEventDetail>(eventName, {
            detail: {
                emitId: id,
                data: data,
            },
        });

        setData(data);
        window.dispatchEvent(customEvent);

        if (broadcasted) {
            broadcast.postMessage(data);
        }
    };

    return {
        customId: id,
        data,
        emit,
        setData,
    };
}
