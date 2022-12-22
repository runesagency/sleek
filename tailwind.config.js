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
            screens: {
                "3xl": "1920px",
            },
        },
    },
    plugins: [],
};
