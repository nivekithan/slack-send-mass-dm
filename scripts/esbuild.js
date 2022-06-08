const esbuild = require("esbuild");

const compileTypescriptFiles = async () => {
  const buildRes = await esbuild.build({
    entryPoints: ["src/index.ts"],
    platform: "node",
    external: ["./node_modules/*"],
    outfile: "dist/index.js",
    bundle: true,
    sourcemap: true,
    watch: {
      onRebuild: (error, result) => {
        if (error) console.error(`ESBUILD FAILED ; ${error}`);
        else console.log(`Successfully compiled using esbuild`);
      },
    },
  });

  if (buildRes.errors.length !== 0) {
    console.log(`ESBUILD FAILED WITH ERRORS : ${buildRes.errors.join("\n")}`);
  } else if (buildRes.warnings.length !== 0) {
    console.log(`ESBUILD WARNINGS : ${buildRes.warnings.join("\n")}`);
  } else {
    console.log(`Successfully compiled using esbuild`);
  }
};

compileTypescriptFiles();