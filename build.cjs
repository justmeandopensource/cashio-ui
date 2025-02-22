#!/usr/bin/env node

const { execSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const path = require('path');

class ReactBuilder {
    constructor() {
        this.dockerImageName = 'cashio-ui';
    }

    getPackageVersion() {
        const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
        return packageJson.version;
    }

    async runSemanticRelease() {
        console.log('Running semantic-release...');
        try {
            execSync('npx semantic-release', { stdio: 'inherit' });
            return this.getPackageVersion();
        } catch (error) {
            if (error.status === 0) {
                return this.getPackageVersion();
            }
            throw error;
        }
    }

    buildDockerImage(version) {
        const versionTag = `${this.dockerImageName}:${version}`;
        const latestTag = `${this.dockerImageName}:latest`;

        console.log(`Building Docker image with tags: ${versionTag}, ${latestTag}`);
        
        execSync(`docker build -t ${versionTag} -t ${latestTag} .`, {
            stdio: 'inherit'
        });

        return { versionTag, latestTag };
    }

    async run(options = {}) {
        try {
            const version = await this.runSemanticRelease();
            console.log(`New version determined by semantic-release: ${version}`);

            const { versionTag, latestTag } = this.buildDockerImage(version);
            
            console.log('\nSuccessfully built Docker images with tags:');
            console.log(`- ${versionTag}`);
            console.log(`- ${latestTag}`);

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
