const plugin = require("tailwindcss/plugin");
const fs = require("fs");
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
    plugins: [
        require("@tailwindcss/typography"),
        require("@tailwindcss/line-clamp"),

        /**
         * @description
         * Registering all classes from a css file into Tailwind CSS IntelliSense
         *
         * @note
         * After changing the css file, you need to save this file to update the IntelliSense
         * or by using "Developer: Reload Window" or "Developer: Restart Extension Host" command in VSCode
         */
        plugin(async ({ addComponents }) => {
            const findAllCSSFiles = (path) => {
                let cssFiles = [];

                if (fs.lstatSync(path).isDirectory()) {
                    const filesOrFolders = fs.readdirSync(path);

                    filesOrFolders.forEach((file) => {
                        const filePath = `${path}/${file}`;
                        cssFiles = cssFiles.concat(findAllCSSFiles(filePath));
                    });
                } else {
                    if (path.endsWith(".css")) {
                        cssFiles.push(path);
                    }
                }

                return cssFiles;
            };

            for (const cssFilePath of findAllCSSFiles("./src")) {
                const data = fs.readFileSync(cssFilePath, {
                    encoding: "utf-8",
                    flag: "r",
                });

                // get all classes using regex
                const regex = /^\s+?\.[a-zA-Z-]+/gm;
                const classes = data.match(regex);

                if (classes) {
                    let registeredClasses = [];

                    for (const rawClassName of classes) {
                        const className = rawClassName.trim();

                        if (registeredClasses.includes(className)) {
                            continue;
                        }

                        addComponents({
                            [className]: {},
                        });

                        registeredClasses.push(className);
                    }
                }
            }
        }),
    ],
};
