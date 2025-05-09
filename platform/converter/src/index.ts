#!/usr/bin/env node

import { program } from "commander";
import { parseCss } from "./cssParser";
import { toSettings } from "./brandMapper";
import { writeTerraformFile } from "./tfGenerator";

// CLIプログラムの設定
program
	.name("cognito-convert")
	.description(
		"shadcn/ui global.cssをAWS Cognito Managed Login Brandingに変換します",
	)
	.version("1.0.0", "-v, --version", "バージョンを表示します")
	.option("-c, --css-file <path>", "shadcn/ui global.cssファイルのパス")
	.option("-o, --output <path>", "出力Terraformファイルのパス")
	.parse(process.argv);

// オプションの取得
const options = program.opts();

/**
 * メイン関数
 */
async function main() {
	if (!options.cssFile || !options.output) {
		console.error("CSSファイルと出力ファイルのパスを指定してください。");
		program.help();
		return;
	}
	const data = parseCss(options.cssFile);
	const settings = toSettings(data);
	writeTerraformFile(settings, options.output);

	console.log("Terraformファイルが生成されました:");
}

// メイン関数を実行
main().catch((error) => {
	console.error("エラーが発生しました:", error);
	process.exit(1);
});
