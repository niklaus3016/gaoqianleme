package com.baidu.union;

import android.app.Activity;
import android.content.Context;
import android.util.Log;
import com.baidu.mobads.sdk.api.AdSettings;
import com.baidu.mobads.sdk.api.BaiduNativeAd;
import com.baidu.mobads.sdk.api.BaiduNativeAdManager;
import com.baidu.mobads.sdk.api.BaiduNativeAdView;
import com.baidu.mobads.sdk.api.FeedAdRequestParameters;
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

    @PluginMethod
    public void init(PluginCall call) {
        String appId = call.getString("appId");
        boolean debug = call.getBoolean("debug", false);

        if (appId == null || appId.isEmpty()) {
            call.reject("App ID is required");
            return;
        }

        try {
            // 初始化百度联盟SDK
            AdSettings.setAppSid(appId);
            AdSettings.setDebugMode(debug);
            
            // 获取SDK版本号
            String sdkVersion = AdSettings.getSDKVersion();
            Log.d(TAG, "百度联盟SDK初始化成功，版本号: " + sdkVersion);

            JSObject result = new JSObject();
            result.put("success", true);
            result.put("version", sdkVersion);
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
            // 加载激励视频广告
            rewardVideoAd = new RewardVideoAd(getActivity(), adUnitId, new RewardVideoAdListener() {
                @Override
                public void onAdLoaded() {
                    Log.d(TAG, "广告加载成功");
                    if (loadCall != null) {
                        JSObject result = new JSObject();
                        result.put("success", true);
                        loadCall.resolve(result);
                        loadCall = null;
                    }
                }

                @Override
                public void onAdFailed(String s) {
                    Log.e(TAG, "广告加载失败: " + s);
                    if (loadCall != null) {
                        JSObject result = new JSObject();
                        result.put("success", false);
                        result.put("error", s);
                        loadCall.resolve(result);
                        loadCall = null;
                    }
                }

                @Override
                public void onAdShow() {
                    Log.d(TAG, "广告显示");
                }

                @Override
                public void onAdClick() {
                    Log.d(TAG, "广告点击");
                }

                @Override
                public void onAdClose() {
                    Log.d(TAG, "广告关闭");
                }

                @Override
                public void onRewardVerify(boolean b, int i, String s) {
                    Log.d(TAG, "奖励验证: " + b + " " + i + " " + s);
                    if (showCall != null) {
                        JSObject result = new JSObject();
                        result.put("rewarded", b);
                        result.put("amount", i);
                        result.put("name", s);
                        showCall.resolve(result);
                        showCall = null;
                    }
                }

                @Override
                public void onAdVideoDownloadSuccess() {
                    Log.d(TAG, "广告视频下载成功");
                }

                @Override
                public void onAdVideoDownloadFailed() {
                    Log.d(TAG, "广告视频下载失败");
                }

                @Override
                public void onVideoComplete() {
                    Log.d(TAG, "视频播放完成");
                }
            });

            // 开始加载广告
            rewardVideoAd.load();
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
