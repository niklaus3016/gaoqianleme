package com.gaoqianleme.app;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.bytedance.pangle.PangleAdPlugin;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 注册百青藤广告插件
        registerPlugin(PangleAdPlugin.class);
    }
}
