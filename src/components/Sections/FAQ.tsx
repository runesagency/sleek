import Container from "@/components/Sections/Container";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { IconChevronDown } from "@tabler/icons";
import { useCallback, useState } from "react";

type QnAProps = {
    question: string;
    answer: string;
};

const QnA = ({ question, answer }: QnAProps) => {
    const [ref] = useAutoAnimate();
    const [isOpen, setIsOpen] = useState(false);

    const onOpen = useCallback(() => {
        setIsOpen(true);
    }, []);

    const onClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <div ref={ref} onClick={!isOpen ? onOpen : undefined} className="flex w-full cursor-pointer flex-col gap-4 rounded-lg border border-dark-600 bg-dark-700 px-7 py-5">
            <div onClick={!isOpen ? undefined : onClose} className="flex items-center gap-4">
                <h4 className="ts-xl flex-1">{question}</h4>

                <IconChevronDown className={`flex w-5 shrink-0 duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`} />
            </div>

            {isOpen && <p className="ts-base cursor-text text-justify">{answer}</p>}
        </div>
    );
};

type FAQProps = {
    data: QnAProps[];
};

export default function FAQ({ data }: FAQProps) {
    if (!data || data.length === 0) return null;

    return (
        <Container className={["bg-dark-900", "flex flex-col gap-14 px-48 py-20"]}>
            <h3 className="heading-3 text-center">Have Any Questions?</h3>

            <section className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-9">
                {[...Array(2)].map((_, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-9">
                        {data
                            .filter((_, index) => index % 2 === colIndex)
                            .map((qna, index) => (
                                <QnA key={index} {...qna} />
                            ))}
                    </div>
                ))}
            </section>
        </Container>
    );
}
