package com.baidu.union;

import android.util.Log;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "BaiduAd")
public class BaiduAdPlugin extends Plugin {

    private static final String TAG = "BaiduAdPlugin";
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
            // 暂时返回成功，避免百度SDK依赖问题
            isInitialized = true;
            Log.d(TAG, "百度SDK初始化完成（模拟）");

            JSObject result = new JSObject();
            result.put("success", true);
            result.put("version", "9.42.2");
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

        try {
            if (!isInitialized) {
                JSObject result = new JSObject();
                result.put("success", false);
                result.put("error", "SDK未初始化");
                call.resolve(result);
                return;
            }

            // 暂时返回成功，避免百度SDK依赖问题
            Log.d(TAG, "[百度广告] 激励视频加载成功（模拟）");
            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "加载广告失败: " + e.getMessage());
            JSObject result = new JSObject();
            result.put("success", false);
            result.put("error", e.getMessage());
            call.resolve(result);
        }
    }

    @PluginMethod
    public void showRewardedAd(PluginCall call) {
        try {
            // 暂时返回奖励成功，避免百度SDK依赖问题
            Log.d(TAG, "[百度广告] 激励视频显示成功（模拟）");
            JSObject result = new JSObject();
            result.put("rewarded", true);
            result.put("amount", 10); // 默认奖励10金币
            result.put("name", "金币");
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "显示广告失败: " + e.getMessage());
            JSObject result = new JSObject();
            result.put("rewarded", false);
            result.put("error", e.getMessage());
            call.resolve(result);
        }
    }

    @PluginMethod
    public void isAdLoaded(PluginCall call) {
        JSObject result = new JSObject();
        result.put("isLoaded", true); // 暂时返回true，避免百度SDK依赖问题
        call.resolve(result);
    }
}
