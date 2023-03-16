import ReactSlider from "react-slider";

type SliderProps = {
    min?: number;
    max?: number;
    disabled?: boolean;
    defaultValue?: number;
    value?: number;
    marks?: number[] | boolean | number;
    step?: number;
    onChange?: (value: number) => void;
    onAfterChange?: (value: number) => void;
};

export default function Slider(options: SliderProps) {
    return (
        <ReactSlider
            {...options}
            className="h-1.5 rounded-full bg-white"
            renderThumb={({ key, ...props }, state) => (
                <div key={key} {...props} className="ts-base -mt-3 flex h-8 w-8 cursor-grab items-center justify-center rounded-full bg-white text-dark-900 focus:outline-none">
                    {state.valueNow}
                </div>
            )}
        />
    );
}
