import * as path from "node:path";
import * as esbuild from "esbuild";

const servedir = path.resolve(import.meta.dirname, "./www");

const context = await esbuild.context({
	entryPoints: [path.resolve(import.meta.dirname, "./index.js")],
	bundle: true,
	write: true,
	splitting: true,
	format: "esm",
	platform: "browser",
	//minify: true,
	sourcemap: "linked",
	outdir: servedir,
	entryNames: "[ext]/[name]",
});

await context.watch();

await context.serve({
	servedir,
});
