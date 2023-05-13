"use client";

import type { TablerIcon } from "@tabler/icons-react";

import { SwitchButton } from "@/components/Forms";
import Container from "@/components/Sections/Container";

import { createContext, useContext, useEffect, useRef, useState } from "react";

type FeaturesContextType = {
    activeIndex: number;
    setActiveIndex: (index: number) => void;
    pictureUrl: string;
    setPictureUrl: (url: string) => void;
};

export type FeatureProps = {
    icon: TablerIcon;
    title: string;
    description: string;
} & (
    | {
          pictureUrl: string;
          buttons?: undefined;
      }
    | {
          pictureUrl?: undefined;
          buttons: {
              title: string;
              pictureUrl: string;
          }[];
      }
);

const FeaturesContext = createContext<FeaturesContextType>({
    activeIndex: 0,
    pictureUrl: "",
    setActiveIndex: () => {
        throw new Error("setActiveIndex is not defined");
    },
    setPictureUrl: () => {
        throw new Error("setPictureUrl is not defined");
    },
});

const FeatureSection = ({ icon: Icon, title, description, pictureUrl: defaultPictureUrl, buttons, index }: FeatureProps & { index: number }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [opacity, setOpacity] = useState(index === 0 ? 1 : 0);
    const [pictureUrl, setPictureUrl] = useState(defaultPictureUrl ?? buttons[0].pictureUrl);
    const { pictureUrl: selectedPictureUrl, setPictureUrl: setSelectedPictureUrl, activeIndex, setActiveIndex } = useContext(FeaturesContext);

    useEffect(() => {
        if (!ref.current) return;

        const check = () => {
            if (!ref.current) return;

            const rect = ref.current.getBoundingClientRect();

            // check if the element is in the viewport and is on the middle of the screen, if so, set the active index
            if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2 && activeIndex !== index) {
                setActiveIndex(index);
                setSelectedPictureUrl(pictureUrl);
                setOpacity(1);
            } else if (activeIndex !== index) {
                // set opacity based on the distance from the middle of the screen
                setOpacity(1 - Math.abs(window.innerHeight / 2 - rect.top) / (window.innerHeight / 2));
            }
        };

        document.addEventListener("scroll", check);

        return () => {
            document.removeEventListener("scroll", check);
        };
    }, [activeIndex, selectedPictureUrl, index, pictureUrl, setActiveIndex, setSelectedPictureUrl]);

    return (
        <section ref={ref} className="flex w-full flex-col gap-20 max-lg:!opacity-100 lg:flex-row lg:gap-0" style={{ opacity }}>
            <div className="flex flex-1 flex-col justify-center gap-5">
                <div className="w-max rounded-xl border border-dark-500 bg-dark-600 p-3">
                    <Icon width={32} height={32} />
                </div>

                <h4 className="heading-4">{title}</h4>
                <p className="ts-xl">{description}</p>

                {buttons && (
                    <div className="flex w-full flex-wrap gap-4">
                        {buttons.map(({ title, pictureUrl }, index) => (
                            <SwitchButton
                                key={index}
                                active={pictureUrl === selectedPictureUrl}
                                onClick={() => {
                                    setSelectedPictureUrl(pictureUrl);
                                    setPictureUrl(pictureUrl);
                                }}
                            >
                                {title}
                            </SwitchButton>
                        ))}
                    </div>
                )}
            </div>

            {/* If had a buttons, use the active image */}
            <img src={pictureUrl} alt="" loading="lazy" className="h-80 w-full shrink-0 rounded-3xl bg-dark-600 lg:w-0" />
        </section>
    );
};

const Features = ({ data }: { data: FeatureProps[] }) => {
    const [pictureUrl, setPictureUrl] = useState(data[0].pictureUrl ?? data[0].buttons[0].pictureUrl);
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <Container className={["bg-gradient-to-b from-dark-700 to-dark-800", "flex gap-20 py-20 3xl:px-80"]}>
            <FeaturesContext.Provider
                value={{
                    pictureUrl,
                    setPictureUrl,
                    activeIndex,
                    setActiveIndex,
                }}
            >
                <section className="flex flex-1 flex-col gap-20">
                    {data.map((props, index) => (
                        <FeatureSection key={index} index={index} {...props} />
                    ))}
                </section>

                <section className="hidden w-full shrink-0 lg:block lg:max-w-md xl:max-w-lg 2xl:max-w-xl">
                    <img src={pictureUrl} alt="" loading="lazy" className="sticky top-1/3 h-80 w-full rounded-3xl bg-dark-600" />
                </section>
            </FeaturesContext.Provider>
        </Container>
    );
};

export default Features;
