<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 搞钱了么 - Android APK 构建

## 构建和部署 APK

### 使用 GitHub Actions 自动构建

项目已配置 GitHub Actions 工作流，可以自动构建 Android APK。

**触发构建的方式：**
1. 推送代码到 `main` 或 `master` 分支
2. 创建 Pull Request
3. 在 GitHub Actions 页面手动触发

**下载 APK：**
- 进入仓库的 "Actions" 标签
- 选择 "Build Android APK" 工作流
- 下载构建的 APK 文件

详细说明请查看 [BUILD_APK.md](BUILD_APK.md)

### 本地运行

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

### 本地构建 APK

```bash
# 构建前端
npm run build

# 同步 Capacitor
npm run cap:sync

# 构建 Debug APK
cd android
chmod +x gradlew
./gradlew assembleDebug
```

## 应用信息

- **应用名称**: 搞钱了么
- **包名**: com.gaoqianleme.app
- **前端**: React + Vite
- **移动端**: Capacitor + Android

