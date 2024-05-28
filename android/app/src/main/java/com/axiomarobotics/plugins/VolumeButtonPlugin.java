package com.axiomarobotics.plugins;

import android.content.Context;
import android.media.AudioManager;
import android.os.Handler;
import android.view.KeyEvent;
import android.view.View;

import com.getcapacitor.Bridge;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "VolumeButtonPlugin")
public class VolumeButtonPlugin extends Plugin {
    private static final String VOLUME_BUTTON_PRESSED_EVENT = "volumeButtonPressed";
    private boolean isVolumeButtonPressed = false;
    private Handler handler = new Handler();
    private Runnable volumeButtonLongPressRunnable = new Runnable() {
        @Override
        public void run() {
            if (isVolumeButtonPressed) {
                isVolumeButtonPressed = false;
                JSObject ret = new JSObject();
                ret.put("pressed", true);
                notifyListeners(VOLUME_BUTTON_PRESSED_EVENT, ret);
            }
        }
    };

    @Override
    public void load() {
        super.load();
        final Context context = getContext();
        final AudioManager audioManager = (AudioManager) context.getSystemService(Context.AUDIO_SERVICE);

        Bridge.getActivity().getWindow().getDecorView().setOnKeyListener((v, keyCode, event) -> {
            if (event.getAction() == KeyEvent.ACTION_DOWN && (keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN)) {
                if (!isVolumeButtonPressed) {
                    isVolumeButtonPressed = true;
                    handler.postDelayed(volumeButtonLongPressRunnable, 3000);
                }
                return true;
            } else if (event.getAction() == KeyEvent.ACTION_UP && (keyCode == KeyEvent.KEYCODE_VOLUME_UP || keyCode == KeyEvent.KEYCODE_VOLUME_DOWN)) {
                isVolumeButtonPressed = false;
                handler.removeCallbacks(volumeButtonLongPressRunnable);
                return true;
            }
            return false;
        });
    }
}
