# 超简单！使用 Android Studio 生成签名密钥库

## 第一步：下载并安装 Android Studio

1. 访问 https://developer.android.com/studio
2. 下载适合你系统的版本（Windows/Mac/Linux）
3. 安装 Android Studio（按照安装向导操作）

## 第二步：打开你的项目

1. 启动 Android Studio
2. 选择 **File** → **Open**
3. 选择你的项目文件夹（包含 `android` 文件夹的目录）
4. 等待项目加载完成（首次可能需要几分钟）

## 第三步：生成签名密钥库（只需点击鼠标！）

1. 在顶部菜单栏，点击 **Build**
2. 选择 **Generate Signed Bundle/APK...**
3. 在弹出的窗口中，选择 **APK**，点击 **Next**
4. 点击 **Create new...** 按钮（创建新密钥库）

## 第四步：填写密钥库信息

在弹出的窗口中填写以下信息：

### 密钥库信息：
- **Key store path**: 点击右侧的 **...** 按钮，选择保存位置
  - 建议保存在桌面或容易找到的地方
  - 文件名输入：`release.keystore`
- **Password**: 输入密码（建议使用：`GaoQianLeMe2024!`）
- **Confirm**: 再次输入相同密码

### 密钥信息：
- **Key alias**: 输入 `release`
- **Password**: 输入密码（建议与密钥库密码相同：`GaoQianLeMe2024!`）
- **Confirm**: 再次输入相同密码

### 证书信息（随便填写）：
- **First and Last Name**: 输入 `搞钱了么`
- **Organizational Unit**: 输入 `Development`
- **Organization**: 输入 `GaoQianLeMe`
- **City or Locality**: 输入 `Beijing`
- **State or Province**: 输入 `Beijing`
- **Country Code (XX)**: 输入 `CN`（代表中国）
- **Validity (years)**: 输入 `25`（25 年有效期）

5. 点击 **OK** 按钮
6. 等待密钥库生成完成（几秒钟）

## 第五步：将密钥库转换为 Base64

### Windows 用户：

1. 下载 Base64 编码工具：
   - 访问 https://base64.guru/converter/encode/file
   - 或使用在线工具：https://www.base64encode.org/

2. 上传 `release.keystore` 文件：
   - 点击 "Choose File" 或 "Browse" 按钮
   - 选择你刚才生成的 `release.keystore` 文件

3. 复制 Base64 编码：
   - 复制生成的 Base64 字符串
   - 确保复制了完整的字符串（可能很长）

### Mac 用户：

打开终端（Terminal），执行：
```bash
cd ~/Desktop  # 假设文件在桌面
base64 -i release.keystore | pbcopy
```
Base64 字符串会自动复制到剪贴板。

### Linux 用户：

打开终端，执行：
```bash
cd ~/Desktop  # 假设文件在桌面
base64 -w 0 release.keystore > keystore.base64
cat keystore.base64
```
复制输出的内容。

## 第六步：配置 GitHub Secrets

1. 访问 GitHub 仓库设置：
   - 打开 https://github.com/niklaus3016/gaoqianleme
   - 点击右上角的 **Settings** 标签
   - 在左侧菜单找到 **Secrets and variables**
   - 点击 **Actions**

2. 添加第一个 Secret（KEYSTORE_BASE64）：
   - 点击右上角的 **New repository secret** 按钮
   - **Name**: 输入 `KEYSTORE_BASE64`
   - **Secret**: 粘贴刚才复制的 Base64 字符串
   - 点击 **Add secret** 按钮

3. 添加第二个 Secret（KEYSTORE_PASSWORD）：
   - 再次点击 **New repository secret**
   - **Name**: 输入 `KEYSTORE_PASSWORD`
   - **Secret**: 输入你设置的密钥库密码（例如：`GaoQianLeMe2024!`）
   - 点击 **Add secret** 按钮

4. 添加第三个 Secret（KEY_PASSWORD）：
   - 再次点击 **New repository secret**
   - **Name**: 输入 `KEY_PASSWORD`
   - **Secret**: 输入你设置的密钥密码（例如：`GaoQianLeMe2024!`）
   - 点击 **Add secret** 按钮

5. 添加第四个 Secret（KEY_ALIAS）：
   - 再次点击 **New repository secret**
   - **Name**: 输入 `KEY_ALIAS`
   - **Secret**: 输入 `release`
   - 点击 **Add secret** 按钮

## 第七步：触发构建并下载已签名的 APK

1. 触发构建：
   - 访问 https://github.com/niklaus3016/gaoqianleme/actions
   - 点击 "Build Android APK" 工作流
   - 点击 "Run workflow" 按钮
   - 点击绿色的 "Run workflow" 按钮

2. 等待构建完成（约 5-10 分钟）

3. 下载已签名的 APK：
   - 构建完成后，点击对应的工作流运行记录
   - 滚动到页面底部
   - 在 "Artifacts" 部分找到 `release-apk`
   - 点击下载按钮
   - 解压 ZIP 文件，获得 `app-release.apk`

4. 验证签名：
   - 这个 APK 已经签名，可以直接上传到小米应用商店

## 重要提示：

⚠️ **安全警告**：
- 将 `release.keystore` 文件保存在安全的地方
- 不要分享给任何人
- 不要删除这个文件，以后更新应用还需要用到
- 记住密码，如果忘记了无法找回

✅ **完成标志**：
- GitHub Actions 构建摘要中显示 "Signed and ready for app store submission"
- 下载的 APK 文件名为 `app-release.apk`

## 遇到问题？

### 问题 1：Android Studio 打不开项目
- 确保选择了包含 `android` 文件夹的目录
- 等待 Gradle 同步完成（首次可能需要下载依赖）

### 问题 2：Base64 转换失败
- 确保上传的是 `release.keystore` 文件
- 尝试使用不同的在线工具
- 检查文件是否损坏

### 问题 3：GitHub Actions 构建失败
- 检查 4 个 Secrets 是否都正确配置
- 确认 `KEYSTORE_BASE64` 是完整的 Base64 字符串
- 查看构建日志中的错误信息

### 问题 4：忘记密码
- 无法找回，必须重新生成密钥库
- 新密钥库会导致无法更新现有应用
- 需要卸载旧版本或使用不同的包名

## 需要帮助？

如果遇到任何问题，请告诉我：
1. 你卡在哪一步
2. 看到的错误信息
3. 你的操作系统（Windows/Mac/Linux）

我会帮你解决！
