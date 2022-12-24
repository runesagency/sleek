/* eslint-disable @typescript-eslint/no-var-requires */

const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
    mode: "jit",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx}", //
        "./src/components/**/*.{js,ts,jsx,tsx}", //
    ],
    corePlugins: {
        container: false,
    },
    theme: {
        extend: {
            fontFamily: {
                manrope: ["var(--font-manrope)", ...fontFamily.sans],
            },
            colors: {
                dark: {
                    50: "#C1C2C5",
                    100: "#A6A7AB",
                    200: "#909296",
                    300: "#5C5F66",
                    400: "#373A40",
                    500: "#2C2E33",
                    600: "#25262B",
                    700: "#1A1B1E",
                    800: "#141517",
                    900: "#101113",
                },
            },
            screens: {
                "3xl": "1920px",
            },
        },
    },
    plugins: [],
};
