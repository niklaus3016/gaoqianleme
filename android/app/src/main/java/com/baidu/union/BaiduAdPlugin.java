package com.baidu.union;

import android.util.Log;
import com.baidu.mobads.AdSettings;
import com.baidu.mobads.rewardvideo.RewardVideoAd;
import com.baidu.mobads.rewardvideo.RewardVideoAdListener;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "BaiduAd")
public class BaiduAdPlugin extends Plugin {

    private static final String TAG = "BaiduAdPlugin";
    private RewardVideoAd rewardVideoAd;
    private PluginCall loadCall;
    private PluginCall showCall;
    private boolean isInitialized = false;

    @PluginMethod
    public void init(PluginCall call) {
        String appId = call.getString("appId");
        boolean debug = call.getBoolean("debug", false);

        if (appId == null || appId.isEmpty()) {
            call.reject("App ID is required");
            return;
        }

        try {
            // 初始化百度SDK（9.432版本官方写法）
            AdSettings.setAppId(appId);
            // 测试模式（上线前务必关闭）
            AdSettings.setTestMode(debug);
            // 可选：设置渠道（如应用宝、华为等）
            AdSettings.setChannelId("test_channel");
            
            isInitialized = true;
            Log.d(TAG, "百度SDK初始化完成（9.432版本）");

            JSObject result = new JSObject();
            result.put("success", true);
            result.put("version", AdSettings.getSDKVersion());
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "初始化失败: " + e.getMessage());
            call.reject("初始化失败: " + e.getMessage());
        }
    }

    @PluginMethod
    public void loadRewardedAd(PluginCall call) {
        String adUnitId = call.getString("adUnitId");

        if (adUnitId == null || adUnitId.isEmpty()) {
            call.reject("Ad Unit ID is required");
            return;
        }

        this.loadCall = call;

        try {
            if (!isInitialized) {
                if (loadCall != null) {
                    JSObject result = new JSObject();
                    result.put("success", false);
                    result.put("error", "SDK未初始化");
                    loadCall.resolve(result);
                    loadCall = null;
                }
                return;
            }

            // 加载激励视频广告（9.432版本官方标准写法）
            // 9.432版本RewardVideoAd构造函数：Context + 广告位ID + 监听器
            rewardVideoAd = new RewardVideoAd(getActivity(), adUnitId, new RewardVideoAdListener() {
                // 广告加载成功
                @Override
                public void onAdLoaded() {
                    Log.d(TAG, "[百度广告] 激励视频加载成功");
                    if (loadCall != null) {
                        JSObject result = new JSObject();
                        result.put("success", true);
                        loadCall.resolve(result);
                        loadCall = null;
                    }
                    // 9.432版本加载成功后自动展示，无需手动show()
                }

                // 广告加载失败（9.432版本参数为String类型）
                @Override
                public void onAdFailed(String reason) {
                    Log.e(TAG, "[百度广告] 激励视频加载失败：" + reason);
                    if (loadCall != null) {
                        JSObject result = new JSObject();
                        result.put("success", false);
                        result.put("error", reason);
                        loadCall.resolve(result);
                        loadCall = null;
                    }
                    rewardVideoAd = null;
                }

                // 广告展示
                @Override
                public void onAdShow() {
                    Log.d(TAG, "[百度广告] 激励视频开始展示");
                }

                // 广告点击
                @Override
                public void onAdClick() {
                    Log.d(TAG, "[百度广告] 激励视频被点击");
                }

                // 广告关闭
                @Override
                public void onAdClose() {
                    Log.d(TAG, "[百度广告] 激励视频已关闭");
                    rewardVideoAd = null; // 释放资源
                }

                // 广告播放完成
                @Override
                public void onAdComplete() {
                    Log.d(TAG, "[百度广告] 激励视频播放完成");
                }

                // 奖励验证（核心：发放奖励的依据）
                public void onRewardVerify(boolean verify) {
                    Log.d(TAG, "[百度广告] 奖励验证: " + verify);
                    if (showCall != null) {
                        JSObject result = new JSObject();
                        result.put("rewarded", verify);
                        result.put("amount", 10); // 默认奖励10金币
                        result.put("name", "金币");
                        showCall.resolve(result);
                        showCall = null;
                    }
                }

                // 广告跳过
                public void onAdSkip() {
                    Log.d(TAG, "[百度广告] 激励视频被跳过");
                }
            });

            // 9.432版本：创建实例后自动加载，无loadAd()方法
        } catch (Exception e) {
            Log.e(TAG, "加载广告失败: " + e.getMessage());
            if (loadCall != null) {
                JSObject result = new JSObject();
                result.put("success", false);
                result.put("error", e.getMessage());
                loadCall.resolve(result);
                loadCall = null;
            }
        }
    }

    @PluginMethod
    public void showRewardedAd(PluginCall call) {
        if (rewardVideoAd == null) {
            call.reject("广告未加载");
            return;
        }

        this.showCall = call;

        try {
            // 显示激励视频广告
            rewardVideoAd.show();
        } catch (Exception e) {
            Log.e(TAG, "显示广告失败: " + e.getMessage());
            if (showCall != null) {
                JSObject result = new JSObject();
                result.put("rewarded", false);
                result.put("error", e.getMessage());
                showCall.resolve(result);
                showCall = null;
            }
        }
    }

    @PluginMethod
    public void isAdLoaded(PluginCall call) {
        JSObject result = new JSObject();
        result.put("isLoaded", rewardVideoAd != null);
        call.resolve(result);
    }
}
