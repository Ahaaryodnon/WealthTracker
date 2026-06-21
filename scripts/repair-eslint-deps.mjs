import fs from "node:fs";
import path from "node:path";

const PACKAGE_FIXES = [
  {
    relativePath:
      "node_modules/@typescript-eslint/typescript-estree/node_modules/balanced-match/dist/commonjs/package.json",
    contents: {
      name: "balanced-match-dist-commonjs",
      private: true,
      type: "commonjs",
    },
  },
  {
    relativePath:
      "node_modules/@typescript-eslint/typescript-estree/node_modules/brace-expansion/dist/commonjs/package.json",
    contents: {
      name: "brace-expansion-dist-commonjs",
      private: true,
      type: "commonjs",
    },
  },
  {
    relativePath:
      "node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch/dist/commonjs/package.json",
    contents: {
      name: "minimatch-dist-commonjs",
      private: true,
      type: "commonjs",
    },
  },
];

for (const fix of PACKAGE_FIXES) {
  const target = path.resolve(process.cwd(), fix.relativePath);
  if (!fs.existsSync(target)) {
    continue;
  }

  fs.writeFileSync(target, `${JSON.stringify(fix.contents, null, 2)}\n`, "utf8");
}
