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

const createMedia = (peerNode, nodes) => {
  return new Promise(async (resolve, reject) => {
    try {
      const win = frames[peerNode.id];

      const constraints = {audio: false, video: false};

      peerNode.linksInput.forEach(inputId => {

        let input = nodes.find(node => node.id === inputId);
        if(input) {
          const kind = input.getInfoValueFor('kind');
          const deviceId = input.getPropertyValueFor("from");
          if(kind === "audio") {
            const channelCount = input.getPropertyValueFor("channelCount");
            constraints.audio = {
              channelCount,
              deviceId
            }
          }
        }
      });
      console.log(">>>With constraints", constraints);
      const stream = await win.navigator.mediaDevices.getUserMedia(constraints);
      resolve(stream);
    } catch(err) {
      console.log(">>>Reject", err);
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
      const stream = await createMedia(peer, nodes);

    }
    resolve();
  });
}
