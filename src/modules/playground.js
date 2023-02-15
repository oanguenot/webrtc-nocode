import {getDimensionFromResolution, getNodeById, getNodeInfoValue, getPeers, getReady} from "./helper";
import {KEYS, NODES} from "./model";
import {rehydrateObject} from "./builder";

const frames = {};

const createIFrame = (peerNode) => {
  return new Promise((resolve, reject) => {
    const iframesElt = document.querySelector("#frames");
    const iframe = document.createElement('iframe');
    iframe.addEventListener("load", () => {
      resolve(iframe.contentWindow);
    });
    iframe.setAttribute("id", peerNode.id);
    console.log(">>>", window.location);
    iframe.src = `${window.location.href}/iframe.html`;
    iframesElt.appendChild(iframe);
  });
}

const addDefaultMediaInIFrame = (win, kind, id) => {
  const localElt = win.document.querySelector("#local");
  const elt = win.document.createElement(kind);
  elt.setAttribute("id", `local-${id}`);
  elt.setAttribute("width", "64");
  elt.setAttribute("height", "64");
  elt.setAttribute("playsinline", null);
  elt.setAttribute("autoplay", null);
  elt.setAttribute("muted", null);
  localElt.appendChild(elt);
}


const createPeerConnection = (peerNode, stream) => {
  return new Promise((resolve, reject) => {
    const win = frames[peerNode.id];

    if(win) {
      const pc = new win.RTCPeerConnection();
      stream.getTracks().forEach(track => {
        pc.addTrack(track);
      });
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
        let input = getNodeById(inputId, nodes);
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

const call = (callerNode, calleeNode, callNode) => {
  return new Promise((resolve, reject) => {
    console.log("call from", callerNode);
    console.log("recipient", calleeNode);
    console.log("call", callNode);
    resolve();
  });
}

const executeReadyStep = (readyNode, nodes) => {
  return new Promise( (resolve, reject) => {

    const firstNode = getNodeById(readyNode.linksOutput[0], nodes);
    if(!firstNode) {
      resolve();
      return;
    }

    executeANode(readyNode, firstNode, nodes).then(() => {
      resolve();
    })
  });
}

const executeANode = (initialEvent, currentNode, nodes) => {
  console.log("[play] execute node", currentNode.id);
  return new Promise( (resolve, reject) => {
    const promises = [];
    switch (currentNode.node) {
      case NODES.CALL:
        console.log("[play] execute call node");
        const fromPeer = getNodeById(initialEvent.getPropertyValueFor("peer"), nodes);
        const recipientPeer = getNodeById(currentNode.getPropertyValueFor("peer"), nodes);
        resolve();
        if (recipientPeer && fromPeer) {
          promises.push(call(fromPeer, recipientPeer, currentNode));
        } else {
          console.warn("[play] can't call - missing callee");
          reject();
        }
        break;
      default:
        break;
    }

    Promise.all(promises).then(() => {
      const nextNode = getNodeById(currentNode.linksOutput[0], nodes);
      if(!nextNode) {
        console.log("[play] no more step in ready");
        resolve();
        return;
      } else {
        console.log("[play] next step found", nextNode.id);
      }
      return executeANode(initialEvent, nextNode, nodes);
    });
  });
}

export const execute = (nodes) => {
  return new Promise(async (resolve, reject) => {
    console.log("[play] started...");
    // found peer connections for creating iFrame
    const peers = getPeers(nodes);

    // Initialize Peer Connections
    for(const peer of peers) {
      const win = await createIFrame(peer);
      // Store iframe window context associated to a peer connection
      frames[peer.id] = win;
      const stream = await createMedia(peer, nodes);
      await createPeerConnection(peer, stream);
    }

    // Check for the ready event and execute it
    const ready = getReady(nodes);
    if(!ready) {
      reject("No ready event");
    }
    executeReadyStep(ready, nodes).then(() => {
      console.log("[play] ended...");
      resolve();
    });
  });
}

export const rehydrateModel = (nodes) => {
  const model = [];
  nodes.forEach(node => {
    const name = getNodeInfoValue(KEYS.NODE, node);
    const kind = getNodeInfoValue(KEYS.KIND, node);
    const object = rehydrateObject(name, kind, node._posX, node._posY);
    object.rehydrate(node);
    model.push(object);
  });
  return model;
}

export const rehydrateDOM = (nodes) => {
  // update DOM with current properties stored
  nodes.forEach(node => {
    const properties = node.properties;
    properties.forEach(property => {
      node.updateDisplayInObject(property.prop);
    });
  });
}
