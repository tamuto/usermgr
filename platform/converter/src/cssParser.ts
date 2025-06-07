import chroma from "chroma-js";
import fs from "node:fs";
import type { CssVariables } from "./types";

function conv(value: string) {
	if (value.startsWith("oklch")) {
		const [l, a, b] = value
			.replace("oklch(", "")
			.replace(")", "")
			.split(" ")
			.map((v) => Number.parseFloat(v));
		const rgb = chroma.oklch(l, a, b);
		return rgb.hex("rgba").slice(1);
	}
	if (value.endsWith("rem")) {
		const rem = Number.parseFloat(value.replace("rem", ""));
		return Math.round(rem * 16);
	}
	return value;
}

function toCamelCase(str: string): string {
	// アンダースコアまたはハイフンで分割し、2つ目以降の単語の先頭を大文字に変換
	return str
		.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
		.replace(/^[A-Z]/, (c) => c.toLowerCase()); // 先頭文字が大文字なら小文字に変換
}

function parseLine(line: string) {
	const [key, value] = line.split(":");
	return [toCamelCase(key.replace("--", "")), value.replace(";", "").trim()];
}

function parseCssData(
	data: string,
	callback: (isDark: boolean, line: string) => void,
) {
	// 行ごとに分割
	const lines = data.split("\n");

	let inRoot = false;
	let inDark = false;

	// 各行を処理
	for (const line of lines) {
		const trimmedLine = line.trim();

		// :root セクションの開始を検出
		if (trimmedLine === ":root {") {
			inRoot = true;
			continue;
		}

		// .dark セクションの開始を検出
		if (trimmedLine === ".dark {") {
			inDark = true;
			continue;
		}

		// セクションの終了を検出
		if (trimmedLine === "}") {
			inRoot = false;
			inDark = false;
			continue;
		}

		// セクション内の行を処理
		if ((inRoot || inDark) && trimmedLine && trimmedLine !== "{") {
			// 空行でない、かつ { だけの行でない場合に処理
			callback(inDark, trimmedLine);
		}
	}
}

function parseCssFile(
	filePath: string,
	callback: (isDark: boolean, line: string) => void,
) {
	const data = fs.readFileSync(filePath, "utf8");
	parseCssData(data, callback);
}

function parseCss(filePath: string): CssVariables {
	const light: Record<string, string | number> = {};
	const dark: Record<string, string | number> = {};
	parseCssFile(filePath, (isDark, line) => {
		const [key, value] = parseLine(line);
		const settingValue = conv(value);
		if (isDark) {
			dark[key] = settingValue;
		} else {
			light[key] = settingValue;
		}
	});
	return { light, dark };
}

export { parseCss };
