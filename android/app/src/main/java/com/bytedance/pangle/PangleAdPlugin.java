package com.bytedance.pangle;

import android.app.Activity;
import android.content.Context;
import android.util.Log;
import com.bytedance.sdk.openadsdk.AdSlot;
import com.bytedance.sdk.openadsdk.TTAdConfig;
import com.bytedance.sdk.openadsdk.TTAdConstant;
import com.bytedance.sdk.openadsdk.TTAdManager;
import com.bytedance.sdk.openadsdk.TTAdSdk;
import com.bytedance.sdk.openadsdk.TTRewardVideoAd;
import com.bytedance.sdk.openadsdk.TTAdNative;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "PangleAd")
public class PangleAdPlugin extends Plugin {

    private static final String TAG = "PangleAdPlugin";
    private TTAdManager ttAdManager;
    private TTAdNative ttAdNative;
    private TTRewardVideoAd rewardVideoAd;
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
            TTAdConfig config = new TTAdConfig.Builder()
                    .appId(appId)
                    .useTextureView(true)
                    .appName(getActivity().getApplicationInfo().loadLabel(getActivity().getPackageManager()).toString())
                    .titleBarTheme(TTAdConstant.TITLE_BAR_THEME_DARK)
                    .allowShowNotify(true)
                    .allowShowPageWhenScreenLock(true)
                    .debug(debug)
                    .directDownloadNetworkType(TTAdConstant.NETWORK_STATE_WIFI, TTAdConstant.NETWORK_STATE_3G)
                    .supportMultiProcess(false)
                    .build();

            TTAdSdk.init(getActivity().getApplicationContext(), config);
            ttAdManager = TTAdSdk.getAdManager();
            ttAdNative = ttAdManager.createAdNative(getActivity().getApplicationContext());

            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Init failed: " + e.getMessage());
            call.reject("Init failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void loadRewardedAd(PluginCall call) {
        String adUnitId = call.getString("adUnitId");

        if (adUnitId == null || adUnitId.isEmpty()) {
            call.reject("Ad Unit ID is required");
            return;
        }

        if (ttAdNative == null) {
            call.reject("Ad SDK not initialized");
            return;
        }

        this.loadCall = call;

        try {
            AdSlot adSlot = new AdSlot.Builder()
                    .setCodeId(adUnitId)
                    .setSupportDeepLink(true)
                    .setImageAcceptedSize(1080, 1920)
                    .setRewardName("金币")
                    .setRewardAmount(10)
                    .setUserID("user_id")
                    .setMediaExtra("media_extra")
                    .setOrientation(TTAdConstant.VERTICAL)
                    .build();

            ttAdNative.loadRewardVideoAd(adSlot, new TTAdNative.RewardVideoAdListener() {
                @Override
                public void onError(int code, String message) {
                    Log.e(TAG, "Load ad failed: " + code + " " + message);
                    if (loadCall != null) {
                        JSObject result = new JSObject();
                        result.put("success", false);
                        result.put("error", message);
                        loadCall.resolve(result);
                        loadCall = null;
                    }
                }

                @Override
                public void onRewardVideoAdLoad(TTRewardVideoAd ad) {
                    Log.d(TAG, "Ad loaded successfully");
                    rewardVideoAd = ad;
                    if (loadCall != null) {
                        JSObject result = new JSObject();
                        result.put("success", true);
                        loadCall.resolve(result);
                        loadCall = null;
                    }
                }

                @Override
                public void onRewardVideoCached() {
                    Log.d(TAG, "Ad cached successfully");
                }

                @Override
                public void onRewardVideoCached(TTRewardVideoAd ad) {
                    Log.d(TAG, "Ad cached successfully");
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Load ad failed: " + e.getMessage());
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
            call.reject("Ad not loaded");
            return;
        }

        this.showCall = call;

        try {
            rewardVideoAd.setRewardAdInteractionListener(new TTRewardVideoAd.RewardAdInteractionListener() {
                @Override
                public void onRewardVerify(boolean rewarded, int amount, String name) {
                    Log.d(TAG, "Reward verified: " + rewarded + " " + amount + " " + name);
                    if (showCall != null) {
                        JSObject result = new JSObject();
                        result.put("rewarded", rewarded);
                        result.put("amount", amount);
                        result.put("name", name);
                        showCall.resolve(result);
                        showCall = null;
                    }
                }

                @Override
                public void onRewardedVideoAdClicked() {
                    Log.d(TAG, "Ad clicked");
                }

                @Override
                public void onRewardedVideoAdClosed() {
                    Log.d(TAG, "Ad closed");
                }

                @Override
                public void onRewardedVideoAdComplete() {
                    Log.d(TAG, "Ad completed");
                }

                @Override
                public void onRewardedVideoAdError(int code, String message) {
                    Log.e(TAG, "Ad error: " + code + " " + message);
                    if (showCall != null) {
                        JSObject result = new JSObject();
                        result.put("rewarded", false);
                        result.put("error", message);
                        showCall.resolve(result);
                        showCall = null;
                    }
                }

                @Override
                public void onRewardedVideoAdPlayBegin() {
                    Log.d(TAG, "Ad play begin");
                }

                @Override
                public void onRewardedVideoAdPlayEnd() {
                    Log.d(TAG, "Ad play end");
                }

                @Override
                public void onRewardedVideoAdPlayFailed(int code, String message) {
                    Log.e(TAG, "Ad play failed: " + code + " " + message);
                    if (showCall != null) {
                        JSObject result = new JSObject();
                        result.put("rewarded", false);
                        result.put("error", message);
                        showCall.resolve(result);
                        showCall = null;
                    }
                }
            });

            rewardVideoAd.showRewardVideoAd(getActivity());
        } catch (Exception e) {
            Log.e(TAG, "Show ad failed: " + e.getMessage());
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
