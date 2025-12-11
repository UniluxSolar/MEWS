/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#1e2a4a', // Navy Blue (Main Brand / Headings)
                secondary: '#f59e0b', // Gold/Amber (Accent / CTAs)
            }, brand: {
                50: '#fff7ed',
                100: '#ffedd5',
                500: '#f97316',
                600: '#ea580c',
                900: '#7c2d12',
            }
        },
        fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
        }
    },
    plugins: [],
};
