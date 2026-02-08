# Android APK 签名配置指南

本指南将帮助你生成 Android 签名密钥，并配置到 GitHub Secrets 以自动构建已签名的 APK。

## 为什么需要签名？

- **上架应用商店**：小米、华为、应用宝等应用商店要求 APK 必须签名
- **应用更新**：使用相同签名密钥才能更新应用
- **安全认证**：签名确保应用来源可信

## 第一步：生成签名密钥库（Keystore）

### 方法一：使用命令行生成

在本地电脑上打开终端，执行以下命令：

```bash
keytool -genkey -v -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
```

执行后会提示输入以下信息：

1. **输入密钥库口令**：设置一个强密码（例如：`MySecurePassword123!`）
2. **再次输入新口令**：确认密码
3. **您的名字与姓氏是什么？**：输入你的名字或公司名
4. **您的组织单位名称是什么？**：输入部门名称（可选）
5. **您的组织名称是什么？**：输入公司名称（可选）
6. **您所在的城市或区域名称是什么？**：输入城市（例如：北京）
7. **您所在的省/市/自治区名称是什么？**：输入省份（例如：北京）
8. **该单位的双字母国家/地区代码是什么？**：输入国家代码（中国：`CN`）
9. **正确吗？**：输入 `y` 确认
10. **输入 <release> 的密钥口令**：按 Enter 使用与密钥库相同的密码

### 方法二：使用 Android Studio 生成

1. 打开 Android Studio
2. 选择 **Build** → **Generate Signed Bundle/APK**
3. 选择 **APK**，点击 **Next**
4. 点击 **Create new...** 创建新密钥库
5. 填写密钥库信息：
   - **Key store path**: 选择保存位置（例如：`release.keystore`）
   - **Password**: 设置密钥库密码
   - **Key alias**: 输入 `release`
   - **Key password**: 设置密钥密码
6. 填写证书信息（姓名、组织、城市、国家等）
7. 点击 **OK** 创建密钥库

## 第二步：将密钥库转换为 Base64

在终端中执行以下命令（Mac/Linux）：

```bash
base64 -i release.keystore | pbcopy
```

或在 Windows 上：

```bash
certutil -encode release.keystore release.keystore.base64
```

然后打开 `release.keystore.base64` 文件，复制所有内容（包括 `-----BEGIN CERTIFICATE-----` 和 `-----END CERTIFICATE-----`）。

## 第三步：配置 GitHub Secrets

1. **访问 GitHub 仓库设置**：
   - 打开 https://github.com/niklaus3016/gaoqianleme
   - 点击 **Settings** 标签
   - 在左侧菜单选择 **Secrets and variables** → **Actions**

2. **添加 Secrets**：
   点击 **New repository secret**，依次添加以下 4 个 Secret：

   | Secret 名称 | 说明 | 示例值 |
   |------------|------|----------|
   | `KEYSTORE_BASE64` | Base64 编码的密钥库文件 | `MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...` |
   | `KEYSTORE_PASSWORD` | 密钥库密码 | `MySecurePassword123!` |
   | `KEY_PASSWORD` | 密钥密码 | `MySecurePassword123!` |
   | `KEY_ALIAS` | 密钥别名 | `release` |

   **重要提示**：
   - `KEYSTORE_PASSWORD` 和 `KEY_PASSWORD` 通常相同
   - `KEY_ALIAS` 必须与生成密钥库时使用的别名一致（默认为 `release`）
   - `KEYSTORE_BASE64` 必须是完整的 Base64 编码字符串

3. **保存 Secrets**：
   - 填写完每个 Secret 后点击 **Add secret**
   - 重复步骤直到所有 4 个 Secret 都添加完成

## 第四步：触发构建并下载已签名的 APK

1. **触发构建**：
   - 推送代码到 GitHub 或手动触发 Actions
   - 访问 https://github.com/niklaus3016/gaoqianleme/actions

2. **查看构建状态**：
   - 等待构建完成（约 5-10 分钟）
   - 查看构建摘要，确认显示 "Signed and ready for app store submission"

3. **下载已签名的 APK**：
   - 点击对应的工作流运行记录
   - 在 "Artifacts" 部分下载 `release-apk`
   - 解压 ZIP 文件，获得 `app-release.apk`

## 第五步：验证 APK 签名

使用以下命令验证 APK 是否已正确签名：

```bash
# 使用 apksigner（Android SDK 工具）
apksigner verify --print-certs app-release.apk

# 或使用 jarsigner
jarsigner -verify -verbose -certs app-release.apk
```

如果看到 "Verified successfully" 或类似消息，说明签名成功。

## 第六步：上传到应用商店

### 小米应用商店

1. 访问 [小米开发者平台](https://dev.mi.com/distribute)
2. 登录开发者账号
3. 创建应用或更新现有应用
4. 上传已签名的 APK
5. 填写应用信息（名称、描述、截图等）
6. 提交审核

### 其他应用商店

- **华为应用市场**: https://developer.huawei.com/consumer/cn/
- **应用宝**: https://open.tencent.com/
- **OPPO 软件商店**: https://open.oppomobile.com/
- **vivo 应用商店**: https://dev.vivo.com.cn/

## 安全注意事项

⚠️ **非常重要**：

1. **妥善保管密钥库文件**：
   - 不要将 `release.keystore` 提交到 Git
   - 备份密钥库文件到安全位置
   - 不要分享密钥库密码

2. **不要泄露 GitHub Secrets**：
   - Secrets 在 GitHub 中是加密存储的
   - 不要在代码或文档中暴露 Secrets
   - 定期更换密码（如果怀疑泄露）

3. **使用强密码**：
   - 至少 12 个字符
   - 包含大小写字母、数字和特殊字符
   - 不要使用常见密码

4. **密钥有效期**：
   - 建议设置 10000 天（约 27 年）
   - 过期后需要重新签名并重新上传应用

## 常见问题

### Q: 忘记了密钥库密码怎么办？

A: 无法找回密码，必须重新生成密钥库。但新密钥库会导致无法更新现有应用（需要卸载旧版本或使用不同的包名）。

### Q: 可以使用不同的密钥库更新应用吗？

A: 不可以。应用商店要求使用相同签名密钥才能更新应用。如果丢失密钥库，只能创建新应用。

### Q: Debug APK 和 Release APK 有什么区别？

A:
- **Debug APK**: 使用默认密钥签名，仅用于测试
- **Release APK**: 使用你的密钥库签名，可以上架应用商店

### Q: GitHub Actions 构建失败怎么办？

A:
1. 检查 Secrets 是否正确配置
2. 确认 `KEYSTORE_BASE64` 是完整的 Base64 字符串
3. 查看构建日志中的错误信息
4. 确认密钥库密码和别名正确

### Q: 如何在本地测试签名构建？

A:
```bash
# 创建 keystore.properties 文件
echo "storePassword=你的密码" > android/keystore.properties
echo "keyPassword=你的密码" >> android/keystore.properties
echo "keyAlias=release" >> android/keystore.properties
echo "storeFile=release.keystore" >> android/keystore.properties

# 将 release.keystore 放在 android 目录下

# 构建已签名的 APK
cd android
./gradlew assembleRelease
```

## 下一步

完成签名配置后，你可以：
1. 自动构建已签名的 APK
2. 上传到各大应用商店
3. 发布应用给用户使用

如果遇到问题，请查看 [GitHub Actions 构建日志](https://github.com/niklaus3016/gaoqianleme/actions) 获取详细信息。
