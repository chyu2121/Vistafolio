import React, { useRef, useEffect } from "react";

export const useMousePositionRef = (
    containerRef?: React.RefObject<HTMLElement | null>
) => {
    const position = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const updatePosition = (x: number, y: number) => {
            if (containerRef && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                position.current = { x: x - rect.left, y: y - rect.top };
            } else {
                position.current = { x, y };
            }
        };

        const handleMouseMove = (ev: MouseEvent) => {
            updatePosition(ev.clientX, ev.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, [containerRef]);

    return position;
};
