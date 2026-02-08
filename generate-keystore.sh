#!/bin/bash
# Mac/Linux Shell 脚本 - 生成 Android 签名密钥库
# 使用方法：chmod +x generate-keystore.sh && ./generate-keystore.sh

echo "正在生成 Android 签名密钥库..."
echo ""

# 设置密钥库信息
KEYSTORE_NAME="release.keystore"
KEY_ALIAS="release"
KEYSTORE_PASSWORD="GaoQianLeMe2024!"
KEY_PASSWORD="GaoQianLeMe2024!"
VALIDITY=10000

# 证书信息
CN="搞钱了么"
OU="Development"
O="GaoQianLeMe"
L="Beijing"
ST="Beijing"
C="CN"

echo "密钥库信息："
echo "- 密钥库文件: $KEYSTORE_NAME"
echo "- 密钥别名: $KEY_ALIAS"
echo "- 有效期: $VALIDITY 天"
echo ""

# 生成密钥库
keytool -genkeypair -v \
  -keystore "$KEYSTORE_NAME" \
  -alias "$KEY_ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity "$VALIDITY" \
  -storepass "$KEYSTORE_PASSWORD" \
  -keypass "$KEY_PASSWORD" \
  -dname "CN=$CN, OU=$OU, O=$O, L=$L, ST=$ST, C=$C"

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "密钥库生成成功！"
    echo "========================================"
    echo ""
    echo "生成的文件: $KEYSTORE_NAME"
    echo "请将此文件安全保存，不要分享给任何人！"
    echo ""
    echo "下一步："
    echo "1. 将 $KEYSTORE_NAME 转换为 Base64："
    echo "   base64 -i $KEYSTORE_NAME | pbcopy  # Mac"
    echo "   base64 -w 0 $KEYSTORE_NAME > keystore.base64  # Linux"
    echo ""
    echo "2. 在 GitHub Secrets 中配置以下信息："
    echo "   - KEYSTORE_BASE64: Base64 编码的密钥库"
    echo "   - KEYSTORE_PASSWORD: $KEYSTORE_PASSWORD"
    echo "   - KEY_PASSWORD: $KEY_PASSWORD"
    echo "   - KEY_ALIAS: $KEY_ALIAS"
    echo ""
else
    echo ""
    echo "========================================"
    echo "密钥库生成失败！"
    echo "========================================"
    echo ""
    echo "请确保已安装 Java JDK 并配置了环境变量。"
    echo "可以通过运行 'java -version' 命令检查 Java 是否安装。"
    echo ""
    exit 1
fi
