package com.gaoqianleme.app;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.baidu.union.BaiduAdPlugin;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 注册百度联盟广告插件
        registerPlugin(BaiduAdPlugin.class);
    }
}
