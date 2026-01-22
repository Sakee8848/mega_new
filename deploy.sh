#!/bin/bash

# 检查是否提供了变更描述
if [ -z "$1" ]; then
  echo "❌ 错误: 请提供本次更改的简述。"
  echo "用法: npm run deploy \"修复了按钮样式并添加了新组件\""
  exit 1
fi

DESC=$1
DATE=$(date +"%Y-%m-%d %H:%M:%S")
VERSION=$(node -p "require('./package.json').version")

# 1. 更新 CHANGELOG.md (自动将新变更插入到最前面)
echo "📝 更新变更日志..."
TEMP_LOG=$(mktemp)
echo -e "# Release Notes\n" > $TEMP_LOG
echo -e "## [$DATE] - Version $VERSION\n" >> $TEMP_LOG
echo -e "### 🚀 Changes:\n- $DESC\n" >> $TEMP_LOG
if [ -f CHANGELOG.md ]; then
    grep -v "# Release Notes" CHANGELOG.md >> $TEMP_LOG
fi
mv $TEMP_LOG CHANGELOG.md

# 2. 执行 Git 操作
echo "📦 正在推送到 GitHub..."
git add .
git commit -m "deploy: $DESC"
git push origin main

echo "✅ 部署完成！"
echo "🔗 GitHub 地址: https://github.com/Sakee8848/mega_new"
echo "📄 变更已记录在 CHANGELOG.md"
