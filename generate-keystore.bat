@echo off
REM Windows 批处理脚本 - 生成 Android 签名密钥库
REM 使用方法：双击运行此文件

echo 正在生成 Android 签名密钥库...
echo.

REM 设置密钥库信息
set KEYSTORE_NAME=release.keystore
set KEY_ALIAS=release
set KEYSTORE_PASSWORD=GaoQianLeMe2024!
set KEY_PASSWORD=GaoQianLeMe2024!
set VALIDITY=10000

REM 证书信息
set CN=搞钱了么
set OU=Development
set O=GaoQianLeMe
set L=Beijing
set ST=Beijing
set C=CN

echo 密钥库信息：
echo - 密钥库文件: %KEYSTORE_NAME%
echo - 密钥别名: %KEY_ALIAS%
echo - 有效期: %VALIDITY% 天
echo.

REM 生成密钥库
keytool -genkeypair -v -keystore %KEYSTORE_NAME% -alias %KEY_ALIAS% -keyalg RSA -keysize 2048 -validity %VALIDITY% -storepass %KEYSTORE_PASSWORD% -keypass %KEY_PASSWORD% -dname "CN=%CN%, OU=%OU%, O=%O%, L=%L%, ST=%ST%, C=%C%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo 密钥库生成成功！
    echo ========================================
    echo.
    echo 生成的文件: %KEYSTORE_NAME%
    echo 请将此文件安全保存，不要分享给任何人！
    echo.
    echo 下一步：
    echo 1. 将 %KEYSTORE_NAME% 转换为 Base64
    echo 2. 在 GitHub Secrets 中配置以下信息：
    echo    - KEYSTORE_BASE64: Base64 编码的密钥库
    echo    - KEYSTORE_PASSWORD: %KEYSTORE_PASSWORD%
    echo    - KEY_PASSWORD: %KEY_PASSWORD%
    echo    - KEY_ALIAS: %KEY_ALIAS%
    echo.
    pause
) else (
    echo.
    echo ========================================
    echo 密钥库生成失败！
    echo ========================================
    echo.
    echo 请确保已安装 Java JDK 并配置了环境变量。
    echo 可以通过运行 "java -version" 命令检查 Java 是否安装。
    echo.
    pause
)
