import { IconChevronDown, IconChevronUp } from "@tabler/icons";
import { useState } from "react";

export default function FAQ() {
    const dummyFaqData = [
        {
            id: "1",
            question: "What does LOREM mean?",
            answer: "‘Lorem ipsum dolor sit amet, consectetur adipisici elit…’ (complete text) is dummy text that is not meant to mean anything. It is used as a placeholder in magazine layouts, for example, in order to give an impression of the finished document. The text is intentionally unintelligible so that the viewer is not distracted by the content. The language is not real Latin and even the first word ‘Lorem’ does not exist. It is said that the lorem ipsum text has been common among typesetters since the 16th century. (Source: Wikipedia.com).",
        },
        {
            id: "2",
            question: "Where can I subscribe to your newsletter?",
            answer: "‘Lorem ipsum dolor sit amet, consectetur adipisici elit…’ (complete text) is dummy text that is not meant to mean anything. It is used as a placeholder in magazine layouts, for example, in order to give an impression of the finished document. The text is intentionally unintelligible so that the viewer is not distracted by the content. The language is not real Latin and even the first word ‘Lorem’ does not exist. It is said that the lorem ipsum text has been common among typesetters since the 16th century. (Source: Wikipedia.com).",
        },
        {
            id: "3",
            question: "Where can I edit my billing and shipping address?",
            answer: "‘Lorem ipsum dolor sit amet, consectetur adipisici elit…’ (complete text) is dummy text that is not meant to mean anything. It is used as a placeholder in magazine layouts, for example, in order to give an impression of the finished document. The text is intentionally unintelligible so that the viewer is not distracted by the content. The language is not real Latin and even the first word ‘Lorem’ does not exist. It is said that the lorem ipsum text has been common among typesetters since the 16th century. (Source: Wikipedia.com).",
        },
        {
            id: "4",
            question: "Can I order a free sample copy of a magazine?",
            answer: "‘Lorem ipsum dolor sit amet, consectetur adipisici elit…’ (complete text) is dummy text that is not meant to mean anything. It is used as a placeholder in magazine layouts, for example, in order to give an impression of the finished document. The text is intentionally unintelligible so that the viewer is not distracted by the content. The language is not real Latin and even the first word ‘Lorem’ does not exist. It is said that the lorem ipsum text has been common among typesetters since the 16th century. (Source: Wikipedia.com).",
        },
        {
            id: "5",
            question: "Are unsold magazines sent back to the publisher?",
            answer: "‘Lorem ipsum dolor sit amet, consectetur adipisici elit…’ (complete text) is dummy text that is not meant to mean anything. It is used as a placeholder in magazine layouts, for example, in order to give an impression of the finished document. The text is intentionally unintelligible so that the viewer is not distracted by the content. The language is not real Latin and even the first word ‘Lorem’ does not exist. It is said that the lorem ipsum text has been common among typesetters since the 16th century. (Source: Wikipedia.com).",
        },
        {
            id: "6",
            question: "We would like to sell our magazine through your shop but we haven’t yet received an answer",
            answer: "‘Lorem ipsum dolor sit amet, consectetur adipisici elit…’ (complete text) is dummy text that is not meant to mean anything. It is used as a placeholder in magazine layouts, for example, in order to give an impression of the finished document. The text is intentionally unintelligible so that the viewer is not distracted by the content. The language is not real Latin and even the first word ‘Lorem’ does not exist. It is said that the lorem ipsum text has been common among typesetters since the 16th century. (Source: Wikipedia.com).",
        },
    ];

    const [isOpens, setIsOpens] = useState<string[]>([]);

    const checkOpen = (id: string) => {
        for (let index = 0; index < isOpens.length; index++) {
            if (isOpens[index] === id) {
                return true;
            }
        }
        return false;
    };

    const handleClick = (id: string) => {
        if (checkOpen(id)) {
            setIsOpens((curr) => curr.filter((elem) => elem !== id));
        } else {
            setIsOpens((curr) => [...curr, id]);
        }
    };

    return (
        <div className="mx-auto columns-2 gap-9 space-y-5">
            {dummyFaqData.map((val, idx) => {
                let status = checkOpen(val.id);
                return (
                    <div key={idx} onClick={() => handleClick(val.id)} className={`flex max-w-lg cursor-pointer justify-between gap-4 rounded-lg bg-dark-700 px-7 py-5 ${status ? "flex-wrap" : ""}`}>
                        <h1 className="flex-initial basis-11/12 text-lg">{val.question}</h1>
                        <IconChevronUp className={`flex w-5 flex-initial flex-col justify-center duration-150 ease-in-out ${status ? "rotate-180" : ""}`} />
                        <h1 className={`text-base ${status ? "block duration-300" : "hidden"}`}>{val.answer}</h1>
                    </div>
                );
            })}
        </div>
    );
}
