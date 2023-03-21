const configuration = {
  refreshEvery: 2000, // Optional. Refresh every 3 seconds
  startAfter: 10, // Optional. Start collecting stats after 5 seconds
  verbose: false, // Optional. Display verbose logs or not.
};

export const monitorPeerConnection = (pc, id, name, frames) => {
  const win = frames[id];

  if (win && win.WebRTCMetrics) {
    win.metrics = new win.WebRTCMetrics(configuration);
    win.metrics.createProbe(win.pc, {
      pname: name,
      uid: id,
      ticket: true,
      record: false,
    });
  }
};

export const startMonitoring = (id, frames) => {
  const win = frames[id];

  if (win && win.metrics) {
    win.metrics.startAllProbes();
  }
};

export const stopMonitoring = (id, frames) => {
  const win = frames[id];
  let ticket = null;
  if (win && win.metrics && win.metrics.running) {
    win.metrics.stopAllProbes();
    win.metrics.probes.forEach((probe) => {
      ticket = probe.getTicket();
    });
  }
  return ticket;
};
