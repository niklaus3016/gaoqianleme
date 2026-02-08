#!/bin/bash
# SealOS DevBox 启动脚本

# 设置环境变量
export NODE_ENV=production

# 启动预构建的 Vite 应用
# 使用 vite preview 启动构建后的应用
npx vite preview --host 0.0.0.0 --port 3000
