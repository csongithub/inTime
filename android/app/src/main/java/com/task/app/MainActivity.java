package com.task.app;

import android.os.Build;
import android.os.Bundle;
import android.view.View;

import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // ✅ THIS replaces setDecorFitsSystemWindows(false)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        View decorView = getWindow().getDecorView();

        ViewCompat.setOnApplyWindowInsetsListener(decorView, (v, insets) -> {

            int bottomInset = insets.getInsets(WindowInsetsCompat.Type.systemBars()).bottom;

            getBridge().getWebView().post(() -> {
                getBridge().getWebView().evaluateJavascript(
                        "window.setAndroidBottomInset(" + bottomInset + ")", null
                );
            });

            return insets;
        });
    }
}