package com.axiomarobotics.radiotaxi;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import java.util.ArrayList;
import com.axiomarobotics.plugins.VolumeButtonPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Registers the VolumeButtonPlugin
        registerPlugin(VolumeButtonPlugin.class);
    }
}
