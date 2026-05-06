/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
    colors: {
        'neutral-50': '#000000',
        'neutral-100': '#ffffff',
        'neutral-200': '#191a1f',
        background: '#191a1f',
        foreground: '#000000'
    },
    fontFamily: {
        body: [
            'Google Sans',
            'sans-serif'
        ]
    },
    fontSize: {
        '13': [
            '13px',
            {
                lineHeight: 'normal'
            }
        ]
    }
},
  },
};
