#!/usr/bin/env node

/**
 * SignFlow 手動テストスクリプト
 * 実際のCognitoを使わずにライブラリの動作をテストします
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 SignFlow 手動テストを開始します...\n');

// テストの種類を選択
const testTypes = [
  '1. 単体テスト実行',
  '2. ビルドテスト',
  '3. 型チェック',
  '4. 全てのテスト',
  '5. HTMLテストページを開く',
];

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 実行中: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, { 
      stdio: 'inherit',
      shell: true,
      ...options 
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ 成功: ${command}`);
        resolve();
      } else {
        console.log(`❌ 失敗: ${command} (終了コード: ${code})`);
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}

async function runUnitTests() {
  console.log('\n🧪 単体テストを実行します...');
  try {
    await runCommand('pnpm', ['test', '--run']);
    console.log('✅ 単体テスト完了');
  } catch (error) {
    console.log('❌ 単体テストで問題が発生しました');
    console.log('💡 テストを修正するか、--passWithNoTests オプションを使用してください');
  }
}

async function runBuildTest() {
  console.log('\n🔨 ビルドテストを実行します...');
  try {
    await runCommand('pnpm', ['build']);
    console.log('✅ ビルド完了');
    
    // 生成されたファイルをチェック
    const distPath = path.join(__dirname, '../dist');
    if (fs.existsSync(distPath)) {
      const files = fs.readdirSync(distPath);
      console.log('📁 生成されたファイル:', files.join(', '));
    }
  } catch (error) {
    console.log('❌ ビルドで問題が発生しました');
  }
}

async function runTypeCheck() {
  console.log('\n🔍 型チェックを実行します...');
  try {
    await runCommand('pnpm', ['typecheck']);
    console.log('✅ 型チェック完了');
  } catch (error) {
    console.log('❌ 型チェックで問題が発生しました');
  }
}

async function openTestPage() {
  console.log('\n🌐 HTMLテストページを開きます...');
  const testPagePath = path.join(__dirname, '../test-app/index.html');
  
  if (fs.existsSync(testPagePath)) {
    const absolutePath = path.resolve(testPagePath);
    console.log(`📄 テストページ: file://${absolutePath}`);
    
    // OS に応じてブラウザを開く
    const os = require('os');
    const platform = os.platform();
    
    try {
      if (platform === 'darwin') {
        await runCommand('open', [absolutePath]);
      } else if (platform === 'win32') {
        await runCommand('start', [absolutePath]);
      } else {
        await runCommand('xdg-open', [absolutePath]);
      }
      console.log('✅ ブラウザでテストページを開きました');
    } catch (error) {
      console.log('❌ ブラウザを開けませんでした');
      console.log(`💡 手動で開いてください: file://${absolutePath}`);
    }
  } else {
    console.log('❌ テストページが見つかりません');
  }
}

async function runAllTests() {
  console.log('\n🎯 全てのテストを実行します...');
  await runTypeCheck();
  await runBuildTest();
  await runUnitTests();
}

async function main() {
  console.log('SignFlow テストオプション:');
  testTypes.forEach(type => console.log(type));
  
  // 引数から選択肢を取得
  const choice = process.argv[2] || '4';
  
  console.log(`\n選択: ${choice}`);
  
  switch (choice) {
    case '1':
      await runUnitTests();
      break;
    case '2':
      await runBuildTest();
      break;
    case '3':
      await runTypeCheck();
      break;
    case '4':
      await runAllTests();
      break;
    case '5':
      await openTestPage();
      break;
    default:
      console.log('❌ 無効な選択です');
      console.log('使用方法: node scripts/test-manual.js [1-5]');
      process.exit(1);
  }
  
  console.log('\n🎉 テスト完了！');
}

main().catch(error => {
  console.error('❌ テストで問題が発生しました:', error.message);
  process.exit(1);
});