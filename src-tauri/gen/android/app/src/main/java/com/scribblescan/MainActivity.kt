package com.scribblescan

import android.os.Bundle
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        // https://github.com/tauri-apps/tauri/issues/12182#issuecomment-2584603995
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
    }
}