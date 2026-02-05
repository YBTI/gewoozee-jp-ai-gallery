---
description: how to deploy the application to Vercel via GitHub
---

# 🚀 Gewoozee JP AI Gallery デプロイガイド

このガイドでは、作成したアプリを GitHub にアップロードし、Vercel で世界中に公開する手順を説明します。

## 1. Git の準備
プロジェクトディレクトリ（`C:\Users\itf\.gemini\antigravity\scratch\gewoozee-jp-ai-gallery`）でターミナルを開き、以下のコマンドを実行します。

```powershell
# 変更をすべてステージング
git add .

# 初回のコミット
git commit -m "Initialize Gewoozee JP AI Gallery"
```

## 2. GitHub リポジトリの作成
1. [GitHub](https://github.com/) にログインし、「New repository」をクリックします。
2. Repository name に `gewoozee-jp-ai-gallery` と入力します。
3. 他の設定はデフォルトのまま「Create repository」をクリックします。

## 3. GitHub への push
リポジトリ作成後の画面に表示されるコマンドを実行します（YOUR_USERNAME をご自身のものに置き換えてください）。

```powershell
git remote add origin https://github.com/YOUR_USERNAME/gewoozee-jp-ai-gallery.git
git branch -M main
git push -u origin main
```

## 4. Vercel での公開
1. [Vercel](https://vercel.com/) にアクセスし、GitHub アカウントでログインします。
2. 「Add New...」→「Project」をクリックします。
3. 先ほど作成した `gewoozee-jp-ai-gallery` リポジトリを選択（Import）します。
4. 設定はそのままで「Deploy」をクリックします。

---

> [!TIP]
> **LocalStorage に関する注意点**
> 現在、投稿データはブラウザの `localStorage` に保存されています。そのため、投稿したデータは「投稿した人のブラウザ」にのみ残ります。
> もし「誰が投稿しても全員に見えるようにしたい」場合は、将来的に Supabase などのデータベース連携が必要です。
