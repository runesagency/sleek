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
                manrope: ["Manrope", "sans-serif"],
            },
            screens: {
                "3xl": "1920px",
            },
        },
    },
    plugins: [],
};
