package com.baidu.union;

import android.app.Activity;
import android.content.Context;
import android.util.Log;
import com.baidu.mobads.sdk.api.BaiduAdManager;
import com.baidu.mobads.sdk.api.BaiduAdInitListener;
import com.baidu.mobads.sdk.api.RewardVideoAd;
import com.baidu.mobads.sdk.api.RewardVideoAdListener;
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
            // 初始化百度联盟SDK（9.42.2版本正确写法）
            BaiduAdManager.getInstance().init(getContext(), appId, new BaiduAdInitListener() {
                @Override
                public void onSuccess() {
                    Log.d(TAG, "百度SDK初始化成功");
                    isInitialized = true;
                    
                    // 获取SDK版本号
                    String sdkVersion = BaiduAdManager.getInstance().getSDKVersion();
                    Log.d(TAG, "百度联盟SDK版本号: " + sdkVersion);

                    JSObject result = new JSObject();
                    result.put("success", true);
                    result.put("version", sdkVersion);
                    call.resolve(result);
                }

                @Override
                public void onFail(int code, String msg) {
                    Log.e(TAG, "百度SDK初始化失败：code=" + code + ", msg=" + msg);
                    isInitialized = false;
                    call.reject("初始化失败: " + msg);
                }
            });
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

            // 加载激励视频广告（9.42.2版本正确写法）
            rewardVideoAd = new RewardVideoAd(getActivity(), adUnitId, new RewardVideoAdListener() {
                @Override
                public void onAdLoaded() {
                    Log.d(TAG, "激励视频广告加载成功");
                    if (loadCall != null) {
                        JSObject result = new JSObject();
                        result.put("success", true);
                        loadCall.resolve(result);
                        loadCall = null;
                    }
                }

                @Override
                public void onAdFailed(int code, String msg) {
                    Log.e(TAG, "激励视频广告加载失败：code=" + code + ", msg=" + msg);
                    if (loadCall != null) {
                        JSObject result = new JSObject();
                        result.put("success", false);
                        result.put("error", msg);
                        loadCall.resolve(result);
                        loadCall = null;
                    }
                }

                @Override
                public void onAdShow() {
                    Log.d(TAG, "激励视频广告开始展示");
                }

                @Override
                public void onAdClick() {
                    Log.d(TAG, "激励视频广告被点击");
                }

                @Override
                public void onAdClose() {
                    Log.d(TAG, "激励视频广告关闭");
                }

                @Override
                public void onAdComplete() {
                    Log.d(TAG, "激励视频广告播放完成");
                }

                @Override
                public void onRewardVerify(boolean verify) {
                    Log.d(TAG, "奖励验证: " + verify);
                    if (showCall != null) {
                        JSObject result = new JSObject();
                        result.put("rewarded", verify);
                        result.put("amount", 10); // 默认奖励10金币
                        result.put("name", "金币");
                        showCall.resolve(result);
                        showCall = null;
                    }
                }

                @Override
                public void onAdSkip() {
                    Log.d(TAG, "激励视频广告被跳过");
                }
            });

            // 开始加载广告
            rewardVideoAd.loadAd();
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
