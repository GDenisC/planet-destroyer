import esbuild from 'esbuild';

const IS_PRODUCTION = true;

/** @type {import('esbuild').BuildOptions} */
const config = {
    entryPoints: ['src/index.ts'],
    outfile: 'public/bundle.js',
    bundle: true,
    minify: false,//IS_PRODUCTION,
    sourcemap: IS_PRODUCTION ? 'external' : 'linked', // save sourcemap on production to check errors
    target: 'es2020',
    format: 'iife',
    platform: 'browser',
    logLevel: 'info'
};

esbuild.build(config);