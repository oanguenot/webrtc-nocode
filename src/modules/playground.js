import {
  filterICENodeForPeer,
  getDimensionFromResolution,
  getIceChange,
  getNodeById,
  getNodeInfoValue,
  getPeers,
  getReady,
} from "./helper";
import { KEYS, NODES } from "./model";
import { rehydrateObject } from "./builder";

const frames = {};

const delayer = (duration) => {
  return new Promise((resolve, __reject) => {
    console.log(`${new Date().toJSON()} [play] execute delay of ${duration}ms`);
    setTimeout(() => {
      resolve();
    }, duration);
  });
};

const createIFrame = (peerNode) => {
  return new Promise((resolve, reject) => {
    const iframesElt = document.querySelector("#frames");
    const iframe = document.createElement("iframe");
    iframe.addEventListener("load", () => {
      resolve(iframe.contentWindow);
    });
    iframe.setAttribute("id", peerNode.id);
    iframe.src = `${window.location.href}/iframe.html`;
    iframesElt.appendChild(iframe);
  });
};

const updateTitleInIFrame = (win, id) => {
  const titleElt = win.document.querySelector("#frameTitle");
  if (titleElt) {
    titleElt.innerHTML = id;
  }
};

const addDefaultMediaInIFrame = (win, kind, id, isLocal = true) => {
  const localElt = win.document.querySelector(
    `${isLocal ? "#local" : "#remote"}`
  );
  const elt = win.document.createElement(kind);
  elt.setAttribute("id", `${isLocal ? "local" : "remote"}-${id}`);
  elt.setAttribute("width", "64");
  elt.setAttribute("height", "64");
  elt.setAttribute("playsinline", null);
  elt.setAttribute("autoplay", null);
  if (isLocal) {
    elt.setAttribute("muted", null);
  }
  localElt.appendChild(elt);
};

const createPeerConnection = (peerNode, stream, iceEvents, nodes) => {
  return new Promise((resolve, reject) => {
    const win = frames[peerNode.id];

    if (win) {
      win.pc = new win.RTCPeerConnection();
      win.ices = [];
      win.pc.oniceconnectionstatechange = () => {
        const state = win.pc.iceConnectionState;
        console.log(`[ice] ${peerNode.id} state changed to ${state}`);
        // Check iceEvents node to initiate actions
        iceEvents.forEach((eventNode) => {
          const eventState = eventNode.getPropertyValueFor(KEYS.ICESTATE);
          if (eventState === state) {
            console.log(`[ice] execute node ${eventNode.id}`);
            executeEventNode(eventNode, nodes);
          }
        });
      };
      win.pc.onicecandidate = (event) => {
        win.ices.push(event.candidate);
      };
      win.pc.ontrack = (event) => {
        console.log(`[track] ${peerNode.id} received`, event.track);
        addDefaultMediaInIFrame(win, event.track.kind, event.track.id, false);
        const captured = new win.MediaStream();
        captured.addTrack(event.track);
        win.document.querySelector(`#remote-${event.track.id}`).srcObject =
          captured;
      };

      stream.getTracks().forEach((track) => {
        console.log(`[track] ${peerNode.id} add`, track);
        win.pc.addTrack(track);
      });
    }
    resolve();
  });
};

const createMedia = (peerNode, nodes) => {
  return new Promise(async (resolve, reject) => {
    try {
      const win = frames[peerNode.id];
      win.stream = new win.MediaStream();

      for (const inputId of peerNode.linksInput) {
        const constraints = { audio: false, video: false };
        let input = getNodeById(inputId, nodes);
        if (input) {
          const kind = input.getInfoValueFor("kind");
          const deviceId = input.getPropertyValueFor("from");
          if (kind === "audio") {
            const channelCount = input.getPropertyValueFor("channelCount");
            constraints.audio = {
              channelCount,
              deviceId,
            };
          } else {
            const framerate = input.getPropertyValueFor("framerate");
            const resolution = input.getPropertyValueFor("resolution");
            const dimension = getDimensionFromResolution(resolution);
            constraints.video = {
              framerate,
              deviceId,
              width: dimension.width,
              height: dimension.height,
            };
          }
          // Create media element in IFrame
          addDefaultMediaInIFrame(win, kind, deviceId);
          const captured = await win.navigator.mediaDevices.getUserMedia(
            constraints
          );
          win.document.querySelector(`#local-${deviceId}`).srcObject = captured;
          captured.getTracks().forEach((track) => win.stream.addTrack(track));
        }
      }
      resolve(win.stream);
    } catch (err) {
      console.log(">>>Reject", err);
      reject(err);
    }
  });
};

const call = (callerNode, calleeNode, callNode) => {
  return new Promise(async (resolve, reject) => {
    const callerWin = frames[callerNode.id];
    const calleeWin = frames[calleeNode.id];
    if (!callerWin || !calleeWin || !callerWin.pc || !calleeWin.pc) {
      console.warn("Can't call - can't find frames or pc");
      reject();
    }

    console.log(`${new Date().toJSON()} >>>execute call`);
    const offer = await callerWin.pc.createOffer();
    await callerWin.pc.setLocalDescription(offer);
    await delayer(2000);
    await calleeWin.pc.setRemoteDescription(offer);

    callerWin.ices.forEach((ice) => calleeWin.pc.addIceCandidate(ice));
    const answer = await calleeWin.pc.createAnswer();
    await calleeWin.pc.setLocalDescription(answer);
    await delayer(2000);
    await callerWin.pc.setRemoteDescription(answer);
    calleeWin.ices.forEach((ice) => callerWin.pc.addIceCandidate(ice));

    console.log(`${new Date().toJSON()} >>> terminate call`);
    await delayer(2000);
    if (callerWin.pc) {
      callerWin.pc.close();
    }
    if (calleeWin.pc) {
      calleeWin.pc.close();
    }
    if (callerWin.stream) {
      callerWin.stream.getTracks().forEach((track) => track.stop());
    }
    if (calleeWin.stream) {
      calleeWin.stream.getTracks().forEach((track) => track.stop());
    }
    resolve();
  });
};

const executeEventNode = (eventNode, nodes) => {
  return new Promise((resolve, reject) => {
    const firstNode = getNodeById(eventNode.linksOutput[0], nodes);
    if (!firstNode) {
      resolve();
      return;
    }

    executeANode(eventNode, firstNode, nodes).then(() => {
      resolve();
    });
  });
};

const executeANode = (initialEvent, currentNode, nodes) => {
  console.log("[play] execute node", currentNode.id);
  return new Promise((resolve, reject) => {
    const promises = [];
    switch (currentNode.node) {
      case NODES.CALL:
        const fromPeer = getNodeById(
          initialEvent.getPropertyValueFor("peer"),
          nodes
        );
        const recipientPeer = getNodeById(
          currentNode.getPropertyValueFor("peer"),
          nodes
        );
        if (recipientPeer && fromPeer) {
          promises.push(call(fromPeer, recipientPeer, currentNode));
        } else {
          console.warn("[play] can't call - missing callee");
          reject();
        }
        break;
      case NODES.WAIT:
        const delay = currentNode.getPropertyValueFor(KEYS.DELAY);
        promises.push(delayer(delay));
      case NODES.END:
        console.log("[play] end reached!!!");
        promises.push(Promise.resolve());
      default:
        break;
    }

    Promise.all(promises).then(() => {
      const nextNode = getNodeById(currentNode.linksOutput[0], nodes);
      if (!nextNode) {
        console.log("[play] no more step in ready");
        resolve();
        return;
      } else {
        console.log("[play] next step found", nextNode.id);
      }
      return executeANode(initialEvent, nextNode, nodes);
    });
  });
};

export const execute = (nodes) => {
  return new Promise(async (resolve, reject) => {
    console.log("[play] started...");
    // found peer connections for creating iFrame
    const peers = getPeers(nodes);
    const iceEvents = getIceChange(nodes);

    // Initialize Peer Connections
    for (const peer of peers) {
      const win = await createIFrame(peer);
      updateTitleInIFrame(win, peer.id);
      // Store iframe window context associated to a peer connection
      frames[peer.id] = win;
      const stream = await createMedia(peer, nodes);
      const iceEventsForPeer = filterICENodeForPeer(iceEvents, peer.id);
      await createPeerConnection(peer, stream, iceEventsForPeer, nodes);
    }

    // Check for the ready event and execute it
    const ready = getReady(nodes);
    if (!ready) {
      reject("No ready event");
    }
    executeEventNode(ready, nodes).then(() => {
      console.log("[play] ended...");
      resolve();
    });
  });
};

export const rehydrateModel = (nodes) => {
  const model = [];
  nodes.forEach((node) => {
    const name = getNodeInfoValue(KEYS.NODE, node);
    const kind = getNodeInfoValue(KEYS.KIND, node);
    const object = rehydrateObject(name, kind, node._posX, node._posY);
    object.rehydrate(node);
    model.push(object);
  });
  return model;
};

export const rehydrateDOM = (nodes) => {
  // update DOM with current properties stored
  nodes.forEach((node) => {
    const properties = node.properties;
    properties.forEach((property) => {
      node.updateDisplayInObject(property.prop);
    });
  });
};
