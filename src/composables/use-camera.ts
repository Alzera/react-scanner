import { useEffect, useRef, useState } from "react";
import {
  type CameraState,
  releaseStream,
  handleStream,
  getDevices,
  getUserMedia,
  toggleTorch,
} from "../utils/camera";
import { useLocalStorage } from "./use-local-storage";
import { useDocumentVisibility } from "./use-document-visibility";
import { useImmediateState } from "./use-immediate-state";

export type CameraController = {
  readonly video: React.MutableRefObject<HTMLVideoElement | null>;
  readonly camera: {
    readonly capabilities: MediaTrackCapabilities | undefined;
    readonly state: CameraState;
    stream: MediaStream | undefined;
    torch: boolean;
  };
  readonly device: {
    list: MediaDeviceInfo[];
    selected: MediaDeviceInfo | undefined;
    lastSelected: string | undefined;
  };
};

export type UseCameraParameters = {
  onError?: (error: any) => void;
  useLastDeviceId?: boolean;
  autoStart?: boolean;
  autoPause?: boolean;
  constraints?: {
    audio?: boolean;
    video?: boolean;
  };
};

export const useCamera = ({
  onError = console.error,
  useLastDeviceId = true,
  autoStart = true,
  autoPause = false,
  constraints = {
    audio: false,
    video: true,
  },
}: UseCameraParameters = {}): CameraController => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<MediaDeviceInfo>();
  const [stream, setStream] = useImmediateState<MediaStream>();
  const [capabilities, setCapabilities] = useState<MediaTrackCapabilities>();

  const [torchState, setTorchState] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const documentVisibility = useDocumentVisibility();
  const [lastDeviceId, setLastDeviceId] = useLocalStorage<string | null>(
    "last-device-id",
    null
  );

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      stop();
    };
  }, []);

  const stop = async () => {
    setCameraState("stopping");

    await setTorch(false);
    await releaseStream(videoRef.current, stream.current);
    setCapabilities(undefined);
    setStream(undefined);

    setCameraState("idle");
  };

  const error = async (e: any) => {
    await stop().catch(onError);
    onError(e);
  };

  const start = async (device: MediaDeviceInfo) => {
    try {
      if (!videoRef.current) throw new Error("Video element is not mounted");

      const mediaStream = await getUserMedia(constraints, device.deviceId);
      const cap = await (isMounted
        ? handleStream(videoRef.current, mediaStream, device)
        : stop());
      if (!cap) throw new Error("Could not get capabilities");

      setCapabilities(cap);
      setStream(mediaStream);
      setCameraState("display");
    } catch (e) {
      await stop();
      error(e);
    }
  };

  const setTorch = async (target: boolean) => {
    if (!capabilities?.torch || target === torchState) return;
    try {
      await toggleTorch(stream.current, target);
      setTorchState(target);
    } catch (e) {
      await stop();
      error(e);
    }
  };

  useEffect(() => {
    const initDevices = async () => {
      try {
        if (!videoRef.current) throw new Error("Video element is not mounted");

        setCameraState("starting");
        const availableDevices = await getDevices(constraints);
        setDevices(availableDevices);

        if (autoStart && availableDevices.length) {
          let device = availableDevices[0];
          if (useLastDeviceId && lastDeviceId) {
            const foundDevice = availableDevices.find(
              (d) => d.deviceId === lastDeviceId
            );
            if (foundDevice) device = foundDevice;
          }
          setSelectedDevice(device);
        }
      } catch (e) {
        await stop();
        error(e);
      }
    };
    initDevices();
  }, [videoRef]);

  useEffect(() => {
    if (!selectedDevice) return;
    const startSelectedDevice = async () => {
      try {
        const deviceIndex = devices.findIndex(
          (d) => d.deviceId === selectedDevice.deviceId
        );
        if (deviceIndex < 0) return;

        setLastDeviceId(selectedDevice.deviceId);

        await stop();
        await start(selectedDevice);
      } catch (e) {
        await stop();
        error(e);
      }
    };
    startSelectedDevice();
  }, [selectedDevice]);

  useEffect(() => {
    if (autoPause && !documentVisibility) {
      stop();
    } else if (selectedDevice) {
      const deviceIndex = devices.findIndex(
        (d) => d.deviceId === selectedDevice.deviceId
      );
      if (deviceIndex >= 0) start(devices[deviceIndex]);
    }
  }, [documentVisibility]);

  return {
    get video() {
      return videoRef;
    },
    get camera() {
      return {
        get capabilities() {
          return capabilities;
        },
        get state() {
          return cameraState;
        },
        get torch() {
          return torchState;
        },
        set torch(target: boolean) {
          setTorch(target);
        },
        get stream() {
          return stream.current;
        },
      };
    },
    get device() {
      return {
        get list() {
          return devices;
        },
        set list(target: MediaDeviceInfo[]) {
          setDevices(target);
        },
        get selected() {
          return selectedDevice;
        },
        set selected(target: MediaDeviceInfo | undefined) {
          setSelectedDevice(target);
        },
        get lastSelected() {
          return lastDeviceId;
        },
        set lastSelected(target: string | undefined) {
          setLastDeviceId(target);
        },
      };
    },
  };
};
