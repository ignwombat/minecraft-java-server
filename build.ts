// Path
import {
    basename,
    dirname,
    extname,
    join
} from 'node:path';

// FS
import { existsSync, globSync, rmSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';

// External
import { build, type BuildOptions } from 'esbuild';
import { FixImportsPlugin } from 'esbuild-fix-imports';

const distPath = join(process.cwd(), 'dist');
existsSync(distPath) && rmSync(distPath, { recursive: true });

const entryPoints = globSync('src/**/*', {
    exclude: [
        'src/tests',
        'src/types.ts'
    ]
});

const esmOptions: BuildOptions = {
    entryPoints,
    outdir: './dist',

    format: 'esm',
    platform: 'node',
    minify: false,
    treeShaking: true,
    sourcemap: true
};

// ESM
build({
    ...esmOptions,
    plugins: [FixImportsPlugin({
        filter: /\.ts$/,
        inputExtension: '.ts',
        outputExtension: '.js',
        loader: 'ts'
    })]
}).catch(() => process.exit(1));

// CJS (must rewrite source mappings)
build({
    ...esmOptions,
    format: 'cjs',
    sourcemap: false,
    write: false,
    outExtension: { '.js': '.cjs' },
    plugins: [FixImportsPlugin({
        filter: /\.ts$/,
        inputExtension: '.ts',
        outputExtension: '.cjs',
        loader: 'ts'
    })]
})
    .then(async result => result.outputFiles?.map(async file => {
        const contents = Buffer.from(file.contents)
            .toString('utf8');
        
        await mkdir(
            dirname(file.path),
            { recursive: true }
        );

        const ext = extname(file.path);
        const name = basename(file.path).slice(0, -ext.length);
        const footer = `//# sourceMappingURL=${name}.js.map`; 

        await writeFile(
            file.path,
            /\n\r?$/.test(contents)
                ? contents + footer + '\n'
                : contents + '\n' + footer + '\n',
            'utf8'
        );
    }))
    .catch(() => process.exit(1));