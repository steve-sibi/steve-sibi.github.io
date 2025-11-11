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
    let typingTimeout = null;

    // Element references
    const outputElement = document.getElementById('heroTerminalOutput');
    const inputElement = document.getElementById('heroTerminalInput');
    const cursorElement = document.querySelector('.hero-terminal__cursor');

    // Check if terminal elements exist
    if (!outputElement || !inputElement || !cursorElement) {
        console.warn('Hero terminal elements not found');
        return;
    }

    /**
     * Type text character by character with realistic timing
     */
    function typeText(text, element, callback) {
        let charIndex = 0;
        element.textContent = '';

        function typeChar() {
            if (charIndex < text.length) {
                element.textContent += text[charIndex];
                charIndex++;

                // Variable typing speed for more realistic effect
                const delay = Math.random() * 50 + 30; // 30-80ms per character
                typingTimeout = setTimeout(typeChar, delay);
            } else {
                if (callback) callback();
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
        if (isTyping) return;
        isTyping = true;

        // Type the command
        typeText(sequence.command, inputElement, function () {
            // Show command in output
            setTimeout(function () {
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
                        setTimeout(showNextOutput, 400);
                    } else {
                        // Command complete, wait before next
                        manageOutputHistory();
                        setTimeout(function () {
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
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            // Show static content instead
            addOutput('$ whoami', 'terminal-command');
            addOutput('steve-sibi', 'terminal-success');
            addOutput('$ cat skills.txt', 'terminal-command');
            addOutput('Cybersecurity Specialist | Penetration Tester', 'terminal-result');
            return;
        }

        // Start with a small delay
        setTimeout(function () {
            executeCommand(commandSequences[0]);
        }, 1500);
    }

    /**
     * Cleanup function
     */
    function cleanup() {
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
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
