# 搞钱了么 - Android APK 构建指南

## 使用 GitHub Actions 自动构建 APK

### 触发构建

GitHub Actions 会在以下情况自动触发构建：

1. **推送到 main/master 分支**
   ```bash
   git push origin main
   ```

2. **创建 Pull Request**
   ```bash
   # 创建 PR 到 main/master 分支
   ```

3. **手动触发**
   - 进入 GitHub 仓库
   - 点击 "Actions" 标签
   - 选择 "Build Android APK" 工作流
   - 点击 "Run workflow" 按钮

### 下载构建的 APK

1. 等待工作流完成（通常需要 5-10 分钟）
2. 进入 Actions 页面
3. 点击对应的工作流运行记录
4. 在 "Artifacts" 部分下载：
   - `debug-apk` - 调试版本 APK
   - `release-apk` - 发布版本 APK（未签名）

### 本地构建（可选）

如果需要在本地构建 APK：

```bash
# 安装依赖
npm install

# 构建前端应用
npm run build

# 同步 Capacitor
npm run cap:sync

# 打开 Android Studio（可选）
npm run cap:open:android

# 或直接使用命令行构建
cd android
chmod +x gradlew
./gradlew assembleDebug
```

构建完成后，APK 文件位于：
- `android/app/build/outputs/apk/debug/app-debug.apk`

## 应用信息

- **应用名称**: 搞钱了么
- **包名**: com.gaoqianleme.app
- **版本**: 1.0.0

## 签名 APK（发布到应用商店）

如果需要签名 APK 以发布到应用商店：

1. 创建签名密钥：
   ```bash
   keytool -genkey -v -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
   ```

2. 在 GitHub Secrets 中添加：
   - `KEYSTORE_FILE`: Base64 编码的 keystore 文件
   - `KEYSTORE_PASSWORD`: Keystore 密码
   - `KEY_ALIAS`: 密钥别名
   - `KEY_PASSWORD`: 密钥密码

3. 更新 `.github/workflows/build-android.yml` 以包含签名步骤

## 注意事项

- 首次构建可能需要较长时间（下载 Android SDK）
- Debug APK 可以直接安装测试
- Release APK 需要签名后才能发布
- 确保后端 API 地址在生产环境中可访问
