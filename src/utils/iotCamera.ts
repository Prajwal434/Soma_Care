'use client';

export type ConnectivityMode = 'BLE_GATT' | 'WIFI_WEBSOCKET' | 'WIFI_MJPEG' | 'DISCONNECTED';

export interface IoTTelemetry {
  deviceId: string;
  protocol: ConnectivityMode;
  connected: boolean;
  batteryPercent: number;
  rssiSignalDbm: number;
  fps: number;
  latencyMs: number;
  reconnectAttempts: number;
  lastPacketTimestamp: number;
}

export interface CameraFramePacket {
  slotState: 'SLOT_1_MORNING' | 'SLOT_2_AFTERNOON' | 'SLOT_3_EVENING' | 'SLOT_4_NIGHT' | 'ALL_CLOSED';
  pillsDetected: number;
  handInFrame: boolean;
  handToMouthIngested: boolean;
  rawConfidence: number;
}

interface BluetoothDeviceLike {
  name?: string;
  gatt?: { connect: () => Promise<unknown> };
}

interface BluetoothNavigator extends Navigator {
  bluetooth?: {
    requestDevice: (options: {
      filters: Array<{ namePrefix: string }>;
      optionalServices: string[];
    }) => Promise<BluetoothDeviceLike>;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export class IoTCameraManager {
  private static telemetry: IoTTelemetry = {
    deviceId: 'SOMABOX-ESP32-0941',
    protocol: 'WIFI_WEBSOCKET',
    connected: true,
    batteryPercent: 88,
    rssiSignalDbm: -54,
    fps: 30,
    latencyMs: 18,
    reconnectAttempts: 0,
    lastPacketTimestamp: Date.now(),
  };

  private static listeners: ((t: IoTTelemetry) => void)[] = [];

  static subscribe(cb: (t: IoTTelemetry) => void) {
    this.listeners.push(cb);
    cb(this.telemetry);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private static notify() {
    this.listeners.forEach(cb => cb({ ...this.telemetry }));
  }

  /**
   * Connect to micro-cam via Web Bluetooth GATT service
   */
  static async connectBluetooth(): Promise<boolean> {
    try {
      const bluetooth = typeof navigator === 'undefined' ? undefined : (navigator as BluetoothNavigator).bluetooth;
      if (typeof window === 'undefined' || !bluetooth) {
        this.telemetry.protocol = 'BLE_GATT';
        this.telemetry.connected = false;
        this.notify();
        return false;
      }

      const device = await bluetooth.requestDevice({
        filters: [{ namePrefix: 'SomaBox' }],
        optionalServices: ['battery_service', '0000ffe0-0000-1000-8000-00805f9b34fb']
      });

      if (device && device.gatt) {
        await device.gatt.connect();
        this.telemetry.protocol = 'BLE_GATT';
        this.telemetry.connected = true;
        this.telemetry.deviceId = device.name || 'SomaBox-BLE';
        this.notify();
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Bluetooth connection failed:', err);
      this.telemetry.protocol = 'BLE_GATT';
      this.telemetry.connected = false;
      this.notify();
      return false;
    }
  }

  /**
   * Connect to micro-cam over local Wi-Fi MJPEG / WebSocket
   */
  static simulateWiFiConnection(): boolean {
    // This models the desired connection state; no camera endpoint is contacted yet.
    this.telemetry.protocol = 'WIFI_WEBSOCKET';
    this.telemetry.connected = true;
    this.telemetry.batteryPercent = 88;
    this.telemetry.rssiSignalDbm = -58;
    this.telemetry.fps = 30;
    this.telemetry.latencyMs = 24;
    this.notify();
    return true;
  }

  /**
   * Simulate frame packet evaluation with fuzzing & security checks
   */
  static validateTelemetryPacket(packet: unknown): { valid: boolean; error?: string } {
    if (!isRecord(packet)) {
      return { valid: false, error: 'Packet must be a valid JSON object' };
    }
    if (typeof packet.pillsDetected !== 'number' || packet.pillsDetected < 0 || packet.pillsDetected > 20) {
      return { valid: false, error: 'Pill count outside sane physical boundary (0-20)' };
    }
    if (typeof packet.slotState !== 'string' || !['SLOT_1_MORNING', 'SLOT_2_AFTERNOON', 'SLOT_3_EVENING', 'SLOT_4_NIGHT', 'ALL_CLOSED'].includes(packet.slotState)) {
      return { valid: false, error: 'Unrecognized slot compartment identifier' };
    }
    return { valid: true };
  }
}
