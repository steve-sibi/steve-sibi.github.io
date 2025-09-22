/* global tailwind */
tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'cyber-black': '#000000',
                'cyber-dark': '#111111',
                'cyber-green': '#00ff9f',
                'cyber-green-dark': '#00cc66',
            },
            fontFamily: { 'share-tech': ['"Share Tech Mono"', 'monospace'] },
            backgroundImage: {
                'cyber-grid':
                    "linear-gradient(rgba(0,0,0,0.6) 2px, transparent 2px), linear-gradient(90deg, rgba(0,0,0,0.6) 2px, transparent 2px)"
            }
        }
    }
};
