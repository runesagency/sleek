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
                    50: "#FFFFFF",
                    100: "#F4F6F7",
                    200: "#E1E7EB",
                    300: "#CED7DC",
                    400: "#6C8698",
                    500: "#4B5E69",
                    600: "#2F3B42",
                    700: "#212C32",
                    800: "#191F23",
                    900: "#151B1E",
                },
            },
            screens: {
                "3xl": "1920px",
            },
        },
    },
    plugins: [require("@tailwindcss/typography")],
};
