import esbuild from 'esbuild';

const IS_PRODUCTION = false;

/** @type {import('esbuild').BuildOptions} */
const config = {
    entryPoints: ['src/index.ts'],
    outfile: 'dist/bundle.js',
    bundle: true,
    minify: IS_PRODUCTION,
    sourcemap: IS_PRODUCTION ? 'external' : 'linked', // save sourcemap on production to check errors
    target: 'es2020',
    format: 'iife',
    platform: 'browser',
    logLevel: 'info'
};

esbuild.context(config).then(ctx => ctx.serve({ servedir: 'dist', port: 2222 }));