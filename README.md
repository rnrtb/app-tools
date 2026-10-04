# tools.mirai-study.com

ブラウザだけで動く小規模Webツール集です。初版では **LINEスタンプ画像メーカー** を提供します。

画像処理・ZIP生成・作業保存はすべてクライアントサイドで行い、ユーザー画像をサーバーへ送信しません。

## 開発環境の起動

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
npm run preview
```

成果物は `dist/` に出力されます。

## URL構成

| パス | 内容 |
| --- | --- |
| `/` | ツール一覧 |
| `/line` | LINE関連ツール一覧 |
| `/line/stamp` | LINEスタンプ画像メーカー（ガイド） |
| `/line/stamp/maker` | 作成ツール本体 |

## デプロイ時の注意（SPA）

React Router のクライアントルーティングを使うため、直接 `/line/stamp/maker` などにアクセスした場合も `index.html` を返す設定が必要です。

- **Netlify**: `public/_redirects` を同梱済み
- **Vercel**: ルートの `vercel.json` を同梱済み
- **nginx** 例:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

静的ホストでフォールバックできない場合は、ビルド成果物の配信設定を確認してください。

## 完全クライアントサイド

- 画像の読み込み・編集・PNG書き出し・ZIP生成はブラウザ内で完結
- 作業状態は **IndexedDB** に自動保存（LocalStorageへ大量画像は保存しない）
- ユーザー画像のサーバーアップロード、外部解析API送信は行わない

## LINE公式仕様の管理場所

スタンプ種類ごとの数値・ルールは次の設定ファイルに集約しています。

- `src/config/stampSpecs.ts`

初版は通常の静止画スタンプ（`static`）のみ対応。

- 枚数: 8 / 16 / 24 / 32 / 40
- スタンプ: 370×320 PNG
- main: 240×240 PNG
- tab: 96×74 PNG
- ZIP内ファイル名: `main.png` / `tab.png` / `01.png` …

公式ガイドライン: [LINE Creators Market スタンプガイドライン](https://creator.line.me/ja/guideline/sticker/)

## 将来スタンプ種類を追加する場合

1. `src/config/stampSpecs.ts` に新しい `StampTypeSpec` を追加する  
   （`allowedCounts` / `canvasSize` / `mainSize` / `tabSize` / `maxFileSizeBytes` / `format` / `marginRule` など）
2. `StampTypeId` と `STAMP_SPECS` に登録する
3. UI側は仕様オブジェクトを参照する実装のため、数値ハードコードを増やさない

追加予定の想定順:

1. BIGスタンプ
2. メッセージスタンプ
3. アニメーションスタンプ

初版UIには未完成機能を表示しません。

## 技術スタック

- React + TypeScript + Vite
- react-router-dom
- IndexedDB (`idb`)
- JSZip / file-saver
- @dnd-kit（タッチ対応の並べ替え）

## 非公式表記

本ツールは LINEヤフー株式会社の公式サービスではありません。
