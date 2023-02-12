const frames = {};

const createIFrame = (peerNode) => {
  const iframesElt = document.querySelector("#frames");
  const iframe = document.createElement('iframe');

  iframe.setAttribute("id", peerNode.id);
  iframe.src = "./iframe.html";
  iframesElt.appendChild(iframe);

  return iframe.contentWindow;
}


const createPeerConnection = (peerNode) => {
  return new Promise((resolve, reject) => {
    const win = frames[peerNode.id];

    if(win) {
      const pc = new win.RTCPeerConnection();
    }
    resolve();
  });
}

const createMedia = (peerNode) => {
  return new Promise(async (resolve, reject) => {
    try {
      const win = frames[peerNode.id];
      const stream = await win.navigator.mediaDevices.getUserMedia({audio: true, video: true});
      resolve(stream);
    } catch(err) {
      reject(err);
    }
  });
}


export const execute = (nodes) => {
  return new Promise(async (resolve, reject) => {
    // found peer connections for creating iFrame
    const peers = nodes.filter(item => (item.node === "rtc.peer"));

    for(const peer of peers) {
      const win = createIFrame(peer);
      // Store iframe window context associated to a peer connection
      frames[peer.id] = win;
      await createPeerConnection(peer);
      const stream = await createMedia(peer);
    }
    resolve();
  });
}
