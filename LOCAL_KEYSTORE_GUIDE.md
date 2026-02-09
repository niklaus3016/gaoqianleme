# 🎯 在本地生成密钥库（超详细指南）

## 前提条件

你已经安装了 Java 21，现在只需要在本地运行几个命令。

---

## 方法一：Windows 用户（推荐）

### 第一步：打开命令提示符

1. 按 `Win + R` 键
2. 输入 `cmd`
3. 按 Enter 键

### 第二步：进入项目目录

在命令提示符中输入：

```cmd
cd C:\Users\你的用户名\Desktop\gaoqianleme
```

**注意**：将 `你的用户名` 替换为你的实际用户名，或者直接输入项目所在路径。

### 第三步：生成密钥库

复制以下命令，粘贴到命令提示符中：

```cmd
keytool -genkeypair -v -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000 -storepass GaoQianLeMe2024! -keypass GaoQianLeMe2024! -dname "CN=搞钱了么, OU=Development, O=GaoQianLeMe, L=Beijing, ST=Beijing, C=CN"
```

按 Enter 键执行。

### 第四步：验证生成成功

如果看到类似以下输出，说明成功：

```
Generating 2,048 bit RSA key pair and self-signed certificate (SHA256withRSA) for: CN=搞钱了么, OU=Development, O=GaoQianLeMe, L=Beijing, ST=Beijing, C=CN
[Storing release.keystore]
```

### 第五步：转换为 Base64

继续在命令提示符中输入：

```cmd
certutil -encode release.keystore keystore.base64
```

### 第六步：复制 Base64

1. 找到生成的 `keystore.base64` 文件
2. 右键点击，选择"打开方式" → "记事本"
3. 全选所有内容（Ctrl + A）
4. 复制（Ctrl + C）

---

## 方法二：Mac 用户

### 第一步：打开终端

1. 按 `Command + 空格` 键
2. 输入 `Terminal`
3. 按 Enter 键

### 第二步：进入项目目录

在终端中输入：

```bash
cd ~/Desktop/gaoqianleme
```

**注意**：如果你的项目不在桌面，请替换为实际路径。

### 第三步：生成密钥库

复制以下命令，粘贴到终端中：

```bash
keytool -genkeypair -v -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000 -storepass GaoQianLeMe2024! -keypass GaoQianLeMe2024! -dname "CN=搞钱了么, OU=Development, O=GaoQianLeMe, L=Beijing, ST=Beijing, C=CN"
```

按 Enter 键执行。

### 第四步：验证生成成功

如果看到类似以下输出，说明成功：

```
Generating 2,048 bit RSA key pair and self-signed certificate (SHA256withRSA) for: CN=搞钱了么, OU=Development, O=GaoQianLeMe, L=Beijing, ST=Beijing, C=CN
[Storing release.keystore]
```

### 第五步：转换为 Base64

继续在终端中输入：

```bash
base64 -i release.keystore | pbcopy
```

**注意**：这个命令会自动将 Base64 字符串复制到剪贴板。

### 第六步：粘贴 Base64

打开记事本或文本编辑器，粘贴（Command + V）查看内容。

---

## 方法三：Linux 用户

### 第一步：打开终端

按 `Ctrl + Alt + T` 键。

### 第二步：进入项目目录

在终端中输入：

```bash
cd ~/Desktop/gaoqianleme
```

**注意**：如果你的项目不在桌面，请替换为实际路径。

### 第三步：生成密钥库

复制以下命令，粘贴到终端中：

```bash
keytool -genkeypair -v -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000 -storepass GaoQianLeMe2024! -keypass GaoQianLeMe2024! -dname "CN=搞钱了么, OU=Development, O=GaoQianLeMe, L=Beijing, ST=Beijing, C=CN"
```

按 Enter 键执行。

### 第四步：验证生成成功

如果看到类似以下输出，说明成功：

```
Generating 2,048 bit RSA key pair and self-signed certificate (SHA256withRSA) for: CN=搞钱了么, OU=Development, O=GaoQianLeMe, L=Beijing, ST=Beijing, C=CN
[Storing release.keystore]
```

### 第五步：转换为 Base64

继续在终端中输入：

```bash
base64 -w 0 release.keystore > keystore.base64
cat keystore.base64
```

### 第六步：复制 Base64

选中终端中输出的所有内容，复制。

---

## 下一步：配置 GitHub Secrets

### 访问 GitHub Secrets 页面

打开浏览器，访问：
https://github.com/niklaus3016/gaoqianleme/settings/secrets/actions

### 添加 4 个 Secrets

#### Secret 1: KEYSTORE_BASE64

1. 点击右上角的 "New repository secret" 按钮
2. **Name**: 输入 `KEYSTORE_BASE64`
3. **Secret**: 粘贴刚才复制的 Base64 字符串
4. 点击 "Add secret" 按钮

#### Secret 2: KEYSTORE_PASSWORD

1. 再次点击 "New repository secret" 按钮
2. **Name**: 输入 `KEYSTORE_PASSWORD`
3. **Secret**: 输入 `GaoQianLeMe2024!`
4. 点击 "Add secret" 按钮

#### Secret 3: KEY_PASSWORD

1. 再次点击 "New repository secret" 按钮
2. **Name**: 输入 `KEY_PASSWORD`
3. **Secret**: 输入 `GaoQianLeMe2024!`
4. 点击 "Add secret" 按钮

#### Secret 4: KEY_ALIAS

1. 再次点击 "New repository secret" 按钮
2. **Name**: 输入 `KEY_ALIAS`
3. **Secret**: 输入 `release`
4. 点击 "Add secret" 按钮

---

## 触发构建并下载 APK

### 触发构建

1. 访问：https://github.com/niklaus3016/gaoqianleme/actions
2. 点击 "Build Android APK" 工作流
3. 点击 "Run workflow" 按钮
4. 点击绿色的 "Run workflow" 按钮
5. 等待构建完成（约 5-10 分钟）

### 下载已签名的 APK

1. 构建完成后，点击对应的工作流运行记录
2. 滚动到页面底部
3. 在 "Artifacts" 部分找到 `release-apk`
4. 点击下载按钮
5. 解压 ZIP 文件，获得 `app-release.apk`

✅ **完成！** 这个 APK 已经签名，可以直接上传到小米应用商店。

---

## 重要提示

### 密码管理

⚠️ **记住密码**：`GaoQianLeMe2024!`
- 如果忘记了无法找回
- 必须重新生成密钥库

### 文件管理

📁 **保存好 `release.keystore` 文件**
- 不要删除
- 不要分享给任何人
- 以后更新应用还需要用到

### 验证成功

✅ **成功标志**：
- GitHub Actions 构建摘要显示 "Signed and ready for app store submission"
- 下载的 APK 文件名为 `app-release.apk`

---

## 常见问题

### Q1: keytool 命令找不到

**Windows**:
1. 右键点击"此电脑" → "属性"
2. 点击"高级系统设置" → "环境变量"
3. 在"系统变量"中找到 `Path`
4. 点击"编辑"
5. 添加 Java bin 目录路径（例如：`C:\Program Files\Java\jdk-21\bin`）
6. 重启命令提示符

**Mac/Linux**:
- 确保安装了 JDK：`java -version`
- 如果没有，使用包管理器安装

### Q2: Base64 转换失败

**Windows**:
- 确保安装了 certutil（Windows 自带）
- 如果没有，使用在线工具：https://base64.guru/converter/encode/file

**Mac/Linux**:
- 检查命令是否正确
- 确保在正确的目录

### Q3: GitHub Actions 构建失败

- 检查 4 个 Secrets 是否都正确配置
- 确认 `KEYSTORE_BASE64` 是完整的 Base64 字符串
- 查看构建日志中的错误信息

### Q4: 忘记密码

- 无法找回，必须重新生成密钥库
- 新密钥库会导致无法更新现有应用

---

## 需要帮助？

如果遇到任何问题，请告诉我：
1. 你的操作系统（Windows/Mac/Linux）
2. 卡在哪一步
3. 看到的错误信息

我会帮你解决！
