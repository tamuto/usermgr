import chroma from "chroma-js";
import type { CssVariables } from "./types";

// 色に関するユーティリティ関数

/**
 * 色を8桁のHEX形式（RGBAの16進数）に変換する
 * @param color 変換する色の文字列
 * @returns 8桁の16進数色コード（末尾にアルファ値を含む）
 */
export const convertToRgbaHex = (color: string): string => {
	try {
		// chroma.jsで色を解析
		const chromaColor = chroma(color);

		// RGBの16進数を取得
		const hex = chromaColor.hex().replace("#", "");

		// アルファ値を取得し16進数に変換
		const alpha = Math.round(chromaColor.alpha() * 255)
			.toString(16)
			.padStart(2, "0");

		// RGBHexにアルファを追加
		return `${hex}${alpha}`;
	} catch (e) {
		console.warn(`色の変換に失敗しました: ${color}`, e);
		// 変換に失敗した場合は黒色の不透明を返す
		return "000000ff";
	}
};

/**
 * CSSの変数を解決する
 * @param cssVars CSS変数のマップ
 * @param value 解決する値
 * @returns 解決された値
 */
export const resolveCssVar = (cssVars: Record<string, string>, value: string): string => {
	// CSS変数の参照かどうかをチェック
	if (value?.startsWith("var(")) {
		// var(--color-primary)形式から変数名を抽出
		const varName = value.match(
			/var\(\s*(--[a-zA-Z0-9-]+)(?:\s*,\s*([^)]+))?\s*\)/,
		);

		if (varName?.[1]) {
			const variableName = varName[1];
			const fallback = varName[2];

			// 変数が存在すればその値を返す
			if (variableName in cssVars) {
				// 値がさらに変数を参照している可能性があるため再帰的に解決
				return resolveCssVar(cssVars, cssVars[variableName] as string);
			}
			if (fallback) {
				// フォールバック値があればそれを返す
				return resolveCssVar(cssVars, fallback);
			}
		}
	}

	// 変数でなければそのまま返す
	return value;
};

/**
 * 数値からピクセル値を抽出
 * @param value ピクセル値を含む文字列
 * @returns 数値
 */
export const extractPixelValue = (value: string): number => {
	const match = value.match(/(\d+)px/);
	if (match?.[1]) {
		return Number.parseInt(match[1], 10);
	}
	return 0;
};

/**
 * ダークモードの色を生成する
 * @param lightColor ライトモードの色
 * @returns ダークモードの色
 */
export const generateDarkModeColor = (lightColor: string): string => {
	try {
		// ライトモードの色を暗くする
		const chromaColor = chroma(lightColor);

		// HSLに変換して輝度を調整
		const [h, s, l] = chromaColor.hsl();

		// 輝度が高い場合は暗く、低い場合は明るくする
		let newL: number;
		if (l > 0.5) {
			// 明るい色は暗くする
			newL = Math.max(0.1, l - 0.4);
		} else {
			// 暗い色はさらに暗くする
			newL = Math.max(0.05, l - 0.2);
		}

		const darkColor = chroma.hsl(h, s, newL);

		// アルファ値を保持
		const alpha = chromaColor.alpha();
		const alphaHex = Math.round(alpha * 255)
			.toString(16)
			.padStart(2, "0");

		return darkColor.hex().replace("#", "") + alphaHex;
	} catch (e) {
		console.warn(`ダークモードの色生成に失敗しました: ${lightColor}`, e);
		return "121212ff"; // 暗い灰色を返す
	}
};

/**
 * ホバー色を生成する
 * @param baseColor ベースとなる色
 * @param isDarkMode ダークモードかどうか
 * @returns ホバー時の色
 */
export const generateHoverColor = (
	baseColor: string,
	isDarkMode = false,
): string => {
	try {
		const chromaColor = chroma(baseColor);

		// ダークモードの場合は色を明るく、ライトモードの場合は暗くする
		const adjustment = isDarkMode ? 0.2 : -0.1;

		const hoverColor = chromaColor.brighten(adjustment);

		// アルファ値を保持
		const alpha = chromaColor.alpha();
		const alphaHex = Math.round(alpha * 255)
			.toString(16)
			.padStart(2, "0");

		return hoverColor.hex().replace("#", "") + alphaHex;
	} catch (e) {
		console.warn(`ホバー色の生成に失敗しました: ${baseColor}`, e);
		return baseColor; // 元の色を返す
	}
};

/**
 * アクティブ色を生成する
 * @param baseColor ベースとなる色
 * @param isDarkMode ダークモードかどうか
 * @returns アクティブ時の色
 */
export const generateActiveColor = (
	baseColor: string,
	isDarkMode = false,
): string => {
	try {
		const chromaColor = chroma(baseColor);

		// ダークモードの場合は色を明るく、ライトモードの場合は暗くする
		const adjustment = isDarkMode ? 0.3 : -0.2;

		const activeColor = chromaColor.brighten(adjustment);

		// アルファ値を保持
		const alpha = chromaColor.alpha();
		const alphaHex = Math.round(alpha * 255)
			.toString(16)
			.padStart(2, "0");

		return activeColor.hex().replace("#", "") + alphaHex;
	} catch (e) {
		console.warn(`アクティブ色の生成に失敗しました: ${baseColor}`, e);
		return baseColor; // 元の色を返す
	}
};
