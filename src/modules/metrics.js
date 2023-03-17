import WebRTCMetrics from "webrtcmetrics";

let metrics;

const configuration = {
  refreshEvery: 2000,   // Optional. Refresh every 3 seconds
  startAfter: 1000,     // Optional. Start collecting stats after 5 seconds
  verbose: false,       // Optional. Display verbose logs or not.
};

export const initializeMetrics = () => {
  metrics = new WebRTCMetrics(configuration);
}

export const monitorPeerConnection = (pc, id, name, frames) => {
  if(metrics) {
    const probe = metrics.createProbe(pc, {
      pname: name,
      uid: id,
      ticket: true,
      record: false,
    });
  }
}

export const startMonitoring = () => {
  if (metrics) {
    //metrics.startAllProbes();
  }
}

export const stopMonitoring = () => {
  if(metrics && metrics.isRunning()) {
    metrics.stopAllProbes();
  }
}
