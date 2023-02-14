import clsx from "clsx";

type ContainerProps = {
    /**
     * @param className[0] - Outer wrapper class
     * @param className[1] - Inner wrapper class
     */
    className?: [string?, string?];
    children: React.ReactNode;
    as?: "section" | "nav" | "footer";
    containerRef?: React.RefObject<HTMLDivElement>;
    innerRef?: React.RefObject<HTMLDivElement>;
};

export default function Container({ children, className = [], as = "section", innerRef, containerRef }: ContainerProps) {
    const Wrapper = as;

    return (
        <Wrapper ref={containerRef} className={clsx("w-full", className[0])}>
            <main ref={innerRef} className={clsx("mx-auto max-w-screen-3xl px-12 md:px-16 xl:px-32 3xl:px-48", className[1])}>
                {children}
            </main>
        </Wrapper>
    );
}
