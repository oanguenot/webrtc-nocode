import {getDimensionFromResolution} from "./helper";

const frames = {};

const createIFrame = (peerNode) => {
  return new Promise((resolve, reject) => {
    const iframesElt = document.querySelector("#frames");
    const iframe = document.createElement('iframe');
    iframe.addEventListener("load", () => {
      resolve(iframe.contentWindow);
    });
    iframe.setAttribute("id", peerNode.id);
    iframe.src = "./iframe.html";
    iframesElt.appendChild(iframe);
  });
}

const addDefaultMediaInIFrame = (win, kind, id) => {
  console.log("<ww", win);
  const localElt = win.document.querySelector("#local");
  console.log(">>>", localElt);
  const elt = win.document.createElement(kind);
  elt.setAttribute("id", `local-${id}`);
  elt.setAttribute("width", "64");
  elt.setAttribute("height", "64");
  elt.setAttribute("playsinline", null);
  elt.setAttribute("autoplay", null);
  elt.setAttribute("muted", null);
  localElt.appendChild(elt);
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
      let stream = new win.MediaStream();

      const constraints = {audio: false, video: false};

      for (const inputId of peerNode.linksInput) {
        let input = nodes.find(node => node.id === inputId);
        if (input) {
          const kind = input.getInfoValueFor('kind');
          const deviceId = input.getPropertyValueFor("from");
          if (kind === "audio") {
            const channelCount = input.getPropertyValueFor("channelCount");
            constraints.audio = {
              channelCount,
              deviceId
            }
          } else {
            const framerate = input.getPropertyValueFor("framerate");
            const resolution = input.getPropertyValueFor("resolution");
            const dimension = getDimensionFromResolution(resolution);
            constraints.video = {
              framerate,
              deviceId,
              width: dimension.width,
              height: dimension.height
            }
          }
          // Create media element in IFrame
          addDefaultMediaInIFrame(win, kind, deviceId);
          const captured = await win.navigator.mediaDevices.getUserMedia(constraints);
          win.document.querySelector(`#local-${deviceId}`).srcObject = captured;
          captured.getTracks().forEach(track => stream.addTrack(track));
        }
      }
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
      const win = await createIFrame(peer);
      // Store iframe window context associated to a peer connection
      frames[peer.id] = win;
      await createPeerConnection(peer);
      const stream = await createMedia(peer, nodes);
    }
    resolve();
  });
}
