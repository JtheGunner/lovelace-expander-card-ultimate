/* eslint-disable no-console */
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { replaceCodePlugin } from "vite-plugin-replace";



export default defineConfig({
    plugins: [
        replaceCodePlugin({
            replacements: process.env.DEV ? [
                {
                    from: '"expander-card-ultimate-editor"',
                    to: '"expander-card-editor-ultimate-dev"'
                },
                {
                    from: '"expander-card-ultimate"',
                    to: '"expander-card-ultimate-dev"'
                },
                {
                    from: '"expander-sub-card-ultimate"',
                    to: '"expander-sub-card-ultimate-dev"'
                }
            ] : [
            ],
        }),
        svelte(),
    ],
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'lovelace-expander-card-ultimate.js',
        }
    }
});

process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
        process.exit(1);
    })
    .on('uncaughtException', (err) => {
        console.error(err, 'Uncaught Exception thrown');
        process.exit(1);
    });
