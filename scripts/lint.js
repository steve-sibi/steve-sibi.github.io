#!/usr/bin/env node

'use strict';

/**
 * Lightweight lint runner for CI
 * - Checks JavaScript syntax via `node --check`
 * - Validates JSON data files can be parsed
 */

const { spawnSync } = require('child_process');
const { readdirSync, readFileSync } = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const errors = [];

function checkJavaScriptSyntax() {
    const jsDir = path.join(projectRoot, 'js');
    const files = readdirSync(jsDir).filter((file) => file.endsWith('.js'));

    files.forEach((file) => {
        const filePath = path.join(jsDir, file);
        const result = spawnSync(process.execPath, ['--check', filePath], {
            encoding: 'utf8',
        });

        if (result.status !== 0) {
            errors.push(`JavaScript syntax error in ${path.relative(projectRoot, filePath)}:\n${result.stderr || result.stdout}`);
        }
    });

    console.log(`✓ Checked JavaScript syntax (${files.length} files)`);
}

function validateJsonData() {
    const dataDir = path.join(projectRoot, 'data');
    const files = readdirSync(dataDir).filter((file) => file.endsWith('.json'));

    files.forEach((file) => {
        const filePath = path.join(dataDir, file);
        try {
            JSON.parse(readFileSync(filePath, 'utf8'));
        } catch (error) {
            errors.push(`Invalid JSON in ${path.relative(projectRoot, filePath)}: ${error.message}`);
        }
    });

    console.log(`✓ Validated JSON data (${files.length} files)`);
}

checkJavaScriptSyntax();
validateJsonData();

if (errors.length) {
    console.error('\nLint issues found:');
    errors.forEach((message) => console.error(`- ${message}`));
    process.exit(1);
}

console.log('\n✅ Lint checks passed');
