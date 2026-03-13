import { copyFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dirname, "..");
const srcDir = join(root, "src");
const outDir = join(root, "dist");

const entrypoints = [
  join(srcDir, "background/service-worker.ts"),
  join(srcDir, "content/index.ts"),
  join(srcDir, "content/interceptor.ts"),
];

const result = await Bun.build({
  entrypoints,
  outdir: outDir,
  target: "browser",
  format: "esm",
  splitting: false,
  naming: {
    entry: "[dir]/[name].[ext]",
  },
  plugins: [
    {
      name: "alias",
      setup(build) {
        build.onResolve({ filter: /^@\// }, async (args) => {
          const base = join(srcDir, args.path.slice(2));
          for (const ext of ["", ".ts", ".tsx", "/index.ts"]) {
            const candidate = base + ext;
            if (await Bun.file(candidate).exists()) {
              return { path: candidate };
            }
          }
          return { path: base };
        });
      },
    },
  ],
});

if (!result.success) {
  console.error("Build failed:");
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

copyFileSync(join(srcDir, "manifest.json"), join(outDir, "manifest.json"));

console.log(`Built ${result.outputs.length} files to dist/`);
