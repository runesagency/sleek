import clsx from "clsx";

type ContainerProps = {
    /**
     * @param className[0] - Outer wrapper class
     * @param className[1] - Inner wrapper class
     */
    className?: [string?, string?];
    children: React.ReactNode;
};

export default function Container({ children, className = [] }: ContainerProps) {
    return (
        <section className={clsx("w-full", className[0])}>
            <main className={clsx("mx-auto max-w-screen-3xl", className[1])}>{children}</main>
        </section>
    );
}
