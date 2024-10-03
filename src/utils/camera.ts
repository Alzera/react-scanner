import { eventOn, timeout } from ".";

declare global {
  interface Navigator {
    mozGetUserMedia: any;
  }
  interface HTMLVideoElement {
    mozSrcObject?: MediaStream;
  }
  interface MediaTrackCapabilities {
    torch?: boolean;
  }
  interface MediaTrackConstraintSet {
    torch?: ConstrainBoolean;
  }
}

/**
 * Camera state
 */
export type CameraState = "starting" | "display" | "stopping" | "idle";

/**
 * Wait for video to be ready
 * @param video <video /> element
 * @param delay delay in milliseconds
 * @returns Promise that resolves when video is ready
 */
const videoReady = (video: HTMLVideoElement, delay: number) =>
  new Promise((resolve) => {
    const check = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        resolve(0);
      } else setTimeout(check, delay);
    };
    setTimeout(check, delay);
  });

/**
 * Request camera permission
 * @param constraints <video /> constraints
 * @returns Promise that resolves when camera permission is granted and throws an error if permission is denied
 */
const requestCameraPermission = async (constraints: MediaStreamConstraints) => {
  if (!navigator.mozGetUserMedia) {
    const permissionStatus = await navigator.permissions
      .query({ name: "camera" as any })
      .catch(() => ({ state: "prompt" }));
    if (permissionStatus.state === "granted") return;
  }
  await getUserMedia(constraints).then((s) =>
    s.getTracks().forEach((i) => i.stop())
  );
};

/**
 * Environment camera keywords
 */
const environmentCameraKeywords: string[] = [
  "rear",
  "back",
  "rück",
  "arrière",
  "trasera",
  "trás",
  "traseira",
  "posteriore",
  "后面",
  "後面",
  "背面",
  "后置", // alternative
  "後置", // alternative
  "背置", // alternative
  "задней",
  "الخلفية",
  "후",
  "arka",
  "achterzijde",
  "หลัง",
  "baksidan",
  "bagside",
  "sau",
  "bak",
  "tylny",
  "takakamera",
  "belakang",
  "אחורית",
  "πίσω",
  "spate",
  "hátsó",
  "zadní",
  "darrere",
  "zadná",
  "задня",
  "stražnja",
  "belakang",
  "बैक",
];

/**
 * Check if a camera label is an environment camera
 * @param label camera label
 * @returns true if the camera label is an environment camera
 */
function isEnvironmentCamera(label: string): boolean {
  const lowercaseLabel = label.toLowerCase();

  return environmentCameraKeywords.some((keyword) => {
    return lowercaseLabel.includes(keyword);
  });
}

/**
 * Attach stream to video element and get capabilities
 * @param video <video /> element
 * @param stream stream of camera device
 * @param info device info
 * @returns Promise that resolves when stream is properly handled and returns camera capabilities
 */
export const handleStream = async (
  video: HTMLVideoElement,
  stream: MediaStream,
  info: MediaDeviceInfo
) => {
  const [track] = stream.getVideoTracks();

  const settings = track.getSettings();
  const isEnvironment =
    (settings != null && settings.facingMode === "environment") ||
    isEnvironmentCamera(info.label);
  video.style.transform = isEnvironment ? "" : "scaleX(-1)";

  if (video.srcObject !== undefined) {
    video.srcObject = stream;
  } else if (video.mozSrcObject !== undefined) {
    video.mozSrcObject = stream;
  } else if (window.URL.createObjectURL) {
    video.src = window.URL.createObjectURL(stream as any);
  } else if (window.webkitURL) {
    video.src = window.webkitURL.createObjectURL(stream as any);
  } else {
    video.src = stream as any;
  }

  await eventOn(video, "canplay");

  await video.play();
  await videoReady(video, 750);

  await timeout(500);

  return track?.getCapabilities?.() ?? {};
};

/**
 * Release stream
 * @param video <video /> element
 * @param stream stream of camera device
 * @returns Promise that resolves when stream is properly released
 */
export const releaseStream = async (
  video: HTMLVideoElement | null,
  stream: MediaStream | undefined
) => {
  console.log("Releasing element", video);
  if (video) {
    video.src = "";
    video.srcObject = null;
    video.load();

    await eventOn(video, "error");
  }
  console.log("Releasing stream", stream);
  if (stream) {
    for (const track of stream.getVideoTracks()) {
      stream.removeTrack(track);
      track.stop();
    }
  }
};

const defaultConstraints = { video: true, audio: false };

/**
 * Wrapper around navigator.mediaDevices.getUserMedia
 * @param constraints constraints for getUserMedia
 * @param deviceId device id
 * @returns Promise that resolves when camera is ready
 */
export const getUserMedia = (
  constraints: MediaStreamConstraints,
  deviceId?: string
) => {
  const c = { ...defaultConstraints, ...constraints } as MediaStreamConstraints;
  if (deviceId) c.video = { deviceId };
  return navigator.mediaDevices.getUserMedia(c);
};

/**
 * Get camera devices
 * @param constraints constraints for getUserMedia
 * @returns Promise that resolves when camera devices are ready
 */
export const getDevices = (constraints: MediaStreamConstraints) =>
  requestCameraPermission(constraints)
    .then((_) => navigator.mediaDevices.enumerateDevices())
    .then((ds) => {
      ds = ds.filter(({ kind }) => kind === "videoinput");

      if (
        typeof constraints.video === "object" &&
        typeof constraints.video.facingMode === "string"
      ) {
        const pattern =
          constraints.video.facingMode === "user"
            ? (label: string) => !isEnvironmentCamera(label)
            : isEnvironmentCamera;
        ds = ds.filter(({ label }) => pattern(label));
      }

      return ds;
    });

/**
 * Toggle camera torch
 * @param stream stream of camera device
 * @param target new torch state
 * @returns Promise that resolves when constraints are applied
 */
export const toggleTorch = async (
  stream: MediaStream | undefined,
  target: boolean
) => {
  if (!stream) return;

  const [track] = stream.getVideoTracks();
  await track.applyConstraints({ advanced: [{ torch: target }] });
};
