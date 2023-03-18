import WebRTCMetrics from "webrtcmetrics";

let metrics;

const configuration = {
  refreshEvery: 2000, // Optional. Refresh every 3 seconds
  startAfter: 2000, // Optional. Start collecting stats after 5 seconds
  verbose: true, // Optional. Display verbose logs or not.
};

export const initializeMetrics = () => {
  metrics = new WebRTCMetrics(configuration);
};

export const monitorPeerConnection = (pc, id, name, frames) => {
  const win = frames[id];

  if (win && win.WebRTCMetrics) {
    console.log(">>> 1. monitor peer", id, win.pc);

    win.metrics = new win.WebRTCMetrics(configuration);
    win.metrics.createProbe(win.pc, {
      pname: name,
      uid: id,
      ticket: true,
      record: false,
    });

    console.log(">>> 2. started", win.metrics.version, win.metrics.running);
  }
};

export const startMonitoring = (id, frames) => {
  const win = frames[id];

  if (win && win.metrics) {
    console.log(">>> try to start monitoring for ", id);
    win.metrics.startAllProbes();
  }
};

export const stopMonitoring = (id, frames) => {
  const win = frames[id];

  if (win && win.metrics && win.metrics.isRunning()) {
    win.metrics.stopAllProbes();
  }
};
