#!/usr/bin/env node

const { execSync } = require('child_process');
const { readFileSync } = require('fs');

class ReactBuilder {
    getPackageVersion() {
        const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
        return packageJson.version;
    }

    async runSemanticRelease() {
        console.log('Running semantic-release...');
        try {
            execSync('npx semantic-release --ci false', { stdio: 'inherit' });
            return this.getPackageVersion();
        } catch (error) {
            if (error.status === 0) {
                return this.getPackageVersion();
            }
            throw error;
        }
    }

    async run(options = {}) {
        try {
            const version = await this.runSemanticRelease();
            console.log(`New version determined by semantic-release: ${version}`);
        } catch (error) {
            console.error('Error during build process:', error);
            process.exit(1);
        }
    }
}

if (require.main === module) {
    const builder = new ReactBuilder();
    builder.run();
}

module.exports = ReactBuilder;
