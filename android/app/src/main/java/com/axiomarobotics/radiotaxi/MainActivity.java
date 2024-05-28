package com.axiomarobotics.radiotaxi;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

import com.axiomarobotics.plugins.VolumeButtonPlugin; // Importa tu plugin

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Registers the VolumeButtonPlugin
        this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
            add(VolumeButtonPlugin.class);
        }});
    }
}
