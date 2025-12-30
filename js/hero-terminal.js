/**
 * Hero Terminal Animation Module
 * Handles the typing animation for the 3D floating terminal in the hero section
 */

(function () {
    'use strict';

    // Terminal command sequences with cybersecurity theme
    const commandSequences = [
        {
            command: 'nmap -sV 192.168.1.0/24',
            output: [
                'Starting Nmap scan...',
                'Discovered open services',
                'Scan complete: 24 hosts up'
            ],
            type: 'success'
        },
        {
            command: 'sudo metasploit',
            output: [
                'Starting Metasploit Framework...',
                'Loading modules... [✓]',
                'Ready for penetration testing'
            ],
            type: 'success'
        },
        {
            command: 'wireshark -i eth0',
            output: [
                'Capturing packets...',
                'Analyzing network traffic',
                'Press Ctrl+C to stop'
            ],
            type: 'warning'
        },
        {
            command: 'john --wordlist=rockyou.txt hash.txt',
            output: [
                'Starting password cracker...',
                'Testing 14M passwords',
                'Cracked: 3/5 hashes'
            ],
            type: 'success'
        },
        {
            command: 'sqlmap -u "target.com" --dbs',
            output: [
                'Testing for SQL injection...',
                'Vulnerability detected!',
                'Databases: users, admin, logs'
            ],
            type: 'warning'
        },
        {
            command: 'aircrack-ng capture.cap',
            output: [
                'Analyzing wireless capture...',
                'Attempting WPA handshake crack',
                'Key found: [REDACTED]'
            ],
            type: 'success'
        }
    ];

    let currentSequenceIndex = 0;
    let isTyping = false;
    let isPaused = false;
    let heroInView = true;

    const activeTimeouts = new Set();
    const heroSection = document.getElementById('home');
    const heroBackground = document.querySelector('.hero-animated-bg');
    const heroOverlay = document.querySelector('.hero-animated-overlay');
    const scanline = document.querySelector('.scanline-effect');

    // Element references
    const outputElement = document.getElementById('heroTerminalOutput');
    const inputElement = document.getElementById('heroTerminalInput');

    // Check if essential terminal elements exist
    if (!outputElement || !inputElement) {
        console.warn('Hero terminal elements not found');
        return;
    }

    /**
     * Type text character by character with realistic timing
     */
    function scheduleTimeout(fn, delay) {
        const id = setTimeout(() => {
            activeTimeouts.delete(id);
            if (isPaused) return;
            fn();
        }, delay);
        activeTimeouts.add(id);
        return id;
    }

    function clearAllTimeouts() {
        activeTimeouts.forEach(clearTimeout);
        activeTimeouts.clear();
    }

    function toggleHeroAnimations(paused) {
        [heroBackground, heroOverlay, scanline].forEach(el => {
            if (el) el.classList.toggle('is-paused', paused);
        });
    }

    function pauseTerminal() {
        if (isPaused) return;
        isPaused = true;
        isTyping = false;
        clearAllTimeouts();
        toggleHeroAnimations(true);
    }

    function resumeTerminal() {
        if (!isPaused || document.hidden || !heroInView) return;
        isPaused = false;
        toggleHeroAnimations(false);
        if (!isTyping) {
            scheduleTimeout(() => executeCommand(commandSequences[currentSequenceIndex]), 150);
        }
    }

    function typeText(text, element, callback) {
        let charIndex = 0;
        element.textContent = '';

        function typeChar() {
            if (isPaused) {
                scheduleTimeout(typeChar, 100);
                return;
            }

            if (charIndex < text.length) {
                element.textContent += text[charIndex];
                charIndex++;

                // Variable typing speed for more realistic effect
                const delay = Math.random() * 50 + 30; // 30-80ms per character
                scheduleTimeout(typeChar, delay);
            } else if (callback) {
                callback();
            }
        }

        typeChar();
    }

    /**
     * Add output line to terminal
     */
    function addOutput(text, className = '') {
        const line = document.createElement('div');
        line.className = className;
        line.textContent = text;
        outputElement.appendChild(line);

        // Scroll to bottom if needed
        const terminalBody = outputElement.closest('.hero-terminal__body');
        if (terminalBody) {
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    }

    /**
     * Clear output after a certain number of commands
     */
    function manageOutputHistory() {
        const lines = outputElement.querySelectorAll('div');
        if (lines.length > 20) {
            // Remove oldest lines, keep last 15
            for (let i = 0; i < lines.length - 15; i++) {
                lines[i].remove();
            }
        }
    }

    /**
     * Execute a command sequence
     */
    function executeCommand(sequence) {
        if (isPaused || isTyping) return;
        isTyping = true;

        // Type the command
        typeText(sequence.command, inputElement, function () {
            // Show command in output
            scheduleTimeout(function () {
                addOutput('$ ' + sequence.command, 'terminal-command');
                inputElement.textContent = '';

                // Show output lines one by one
                let outputIndex = 0;
                function showNextOutput() {
                    if (outputIndex < sequence.output.length) {
                        const className = sequence.type === 'success' ? 'terminal-success' :
                            sequence.type === 'warning' ? 'terminal-warning' :
                                'terminal-result';
                        addOutput(sequence.output[outputIndex], className);
                        outputIndex++;
                        scheduleTimeout(showNextOutput, 400);
                    } else {
                        // Command complete, wait before next
                        manageOutputHistory();
                        scheduleTimeout(function () {
                            isTyping = false;
                            nextCommand();
                        }, 2000);
                    }
                }
                showNextOutput();
            }, 300);
        });
    }

    /**
     * Move to next command in sequence
     */
    function nextCommand() {
        currentSequenceIndex = (currentSequenceIndex + 1) % commandSequences.length;
        executeCommand(commandSequences[currentSequenceIndex]);
    }

    /**
     * Initialize terminal animation
     */
    function init() {
        // Check for reduced motion preference
        const prefersReducedMotion = window.prefersReducedMotion ? window.prefersReducedMotion() : false;
        if (prefersReducedMotion) {
            // Show static content instead
            addOutput('$ whoami', 'terminal-command');
            addOutput('steve-sibi', 'terminal-success');
            addOutput('$ cat skills.txt', 'terminal-command');
            addOutput('Cybersecurity Specialist | Penetration Tester', 'terminal-result');
            return;
        }

        // Start with a small delay
        scheduleTimeout(function () {
            executeCommand(commandSequences[0]);
        }, 1500);

        // Pause/resume when hero is off-screen
        if (heroSection && 'IntersectionObserver' in window) {
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    heroInView = entry.isIntersecting;
                });

                if (heroInView && !document.hidden) {
                    resumeTerminal();
                } else {
                    pauseTerminal();
                }
            }, { threshold: 0.2 });

            heroObserver.observe(heroSection);
        }

        // Pause when tab hidden, resume when visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                pauseTerminal();
            } else {
                resumeTerminal();
            }
        });

        // Ensure hero animations start unpaused on load
        toggleHeroAnimations(false);
    }

    /**
     * Cleanup function
     */
    function cleanup() {
        pauseTerminal();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);

})();
