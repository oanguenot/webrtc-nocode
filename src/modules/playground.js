import {
  filterSimilarNodesById,
  filterNodesByName,
  findNodeByName,
  getNodeById,
  getNodeInfoValue,
  getNodesFromIds,
} from "./helper";
import { KEYS, NODES } from "./model";
import { rehydrateObject } from "./builder";
import {
  addLog,
  incrementTaskDone,
  setTaskNumber,
} from "../actions/DebugActions";
import { createTempPeriod, endTempPeriod, hasPeriodFor } from "./timeline";
import {
  addCustomEvent,
  monitorPeerConnection,
  startMonitoring,
  stopMonitoring,
} from "./metrics";

const frames = {};
let dispatcher = null;

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

const createMediaElementInIFrame = (win, kind, id, isLocal = true) => {
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
  return new Promise(async (resolve, _reject) => {
    const win = frames[peerNode.id];

    await peerNode.execute(
      win,
      peerNode,
      stream,
      iceEvents,
      nodes,
      (eventNode, nodes) => {
        executeEventNode(eventNode, nodes);
      },
      createMediaElementInIFrame
    );

    resolve(win.pc);
  });
};

const createMedia = (peerNode, nodes) => {
  return new Promise(async (resolve, reject) => {
    try {
      const win = frames[peerNode.id];
      win.stream = new win.MediaStream();

      for (const inputId of peerNode.linksInput) {
        let input = getNodeById(inputId, nodes);
        if (input) {
          const kind = input.getInfoValueFor("kind");
          const deviceId = input.getPropertyValueFor("from");
          if (deviceId !== "none") {
            // Create media element in IFrame
            createMediaElementInIFrame(win, kind, inputId);

            // Execute track node to get the media
            const captured = await input.execute(win);

            win.document.querySelector(`#local-${inputId}`).srcObject =
              captured;
            captured.getTracks().forEach((track) => {
              track.__wp = inputId;
              win.stream.addTrack(track);
            });
          }
        }
      }
      resolve(win.stream);
    } catch (err) {
      reject(err);
    }
  });
};

const createWatchRTC = (peerNode, nodes) => {
  return new Promise(async (resolve, reject) => {
    try {
      const win = frames[peerNode.id];
      const outputNodes = getNodesFromIds(peerNode.linksOutput, nodes);
      const watchNode = findNodeByName(NODES.WATCH, outputNodes);
      const rtcPeerId = peerNode.getPropertyValueFor("name");

      if (!watchNode) {
        resolve();
        return;
      }

      await watchNode.execute(win, rtcPeerId);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

const call = (callerNode, calleeNode, callNode, nodes) => {
  return new Promise(async (resolve, reject) => {
    const waitForIce = (peer, id) => {
      return new Promise((resolve, reject) => {
        const ices = [];

        peer.addEventListener("icecandidate", (event) => {
          if (event.candidate) {
            ices.push(event.candidate);
          } else {
            resolve(ices);
          }
        });
      });
    };

    const callerWin = frames[callerNode.id];
    const calleeWin = frames[calleeNode.id];
    if (!callerWin || !calleeWin || !callerWin.pc || !calleeWin.pc) {
      console.warn("Can't call - can't find frames or pc");
      reject();
    }

    const munglerId = callNode.linksInput.find((inputId) => {
      const inputNode = getNodeById(inputId, nodes);
      return inputNode.node === NODES.MUNGING;
    });

    let rtcOfferSessionDescription = await callerWin.pc.createOffer();

    if (munglerId) {
      const munglerNode = getNodeById(munglerId, nodes);
      munglerNode.execute(
        callerNode.id,
        frames,
        rtcOfferSessionDescription.sdp
      );
    }

    await callerWin.pc.setLocalDescription(rtcOfferSessionDescription);
    const ices = await waitForIce(callerWin.pc, callerNode.id);

    await calleeWin.pc.setRemoteDescription(rtcOfferSessionDescription);
    const rtcAnswerSessionDescription = await calleeWin.pc.createAnswer();

    if (munglerId) {
      const munglerNode = getNodeById(munglerId, nodes);
      munglerNode.execute(
        calleeNode.id,
        frames,
        rtcAnswerSessionDescription.sdp
      );
    }

    await calleeWin.pc.setLocalDescription(rtcAnswerSessionDescription);

    const calleeIces = await waitForIce(calleeWin.pc, calleeNode.id);
    ices.forEach((ice) => calleeWin.pc.addIceCandidate(ice));

    await callerWin.pc.setRemoteDescription(rtcAnswerSessionDescription);
    calleeIces.forEach((ice) => callerWin.pc.addIceCandidate(ice));
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

    addLog(
      "play",
      "log",
      `execute event ${eventNode.node}|${eventNode.id}`,
      null
    );

    executeANode(eventNode, firstNode, nodes).then(() => {
      resolve();
    });
  });
};

const executeANode = (initialEvent, currentNode, nodes) => {
  addLog(
    "play",
    "log",
    `execute node ${currentNode.node}|${currentNode.id}`,
    null
  );
  return new Promise((resolve, reject) => {
    const promises = [];
    switch (currentNode.node) {
      case NODES.CALL: {
        promises.push(currentNode.execute(nodes, frames));
        break;
      }
      case NODES.WAIT: {
        promises.push(currentNode.execute());
        break;
      }
      case NODES.ENCODE: {
        promises.push(currentNode.execute(nodes, frames));
        break;
      }
      case NODES.ADJUST: {
        promises.push(currentNode.execute(nodes, frames));
        break;
      }
      case NODES.RESTARTICE: {
        promises.push(currentNode.execute(nodes, frames, call));
        break;
      }
      case NODES.END: {
        promises.push(
          currentNode.execute(nodes, frames, (tickets) => {
            console.log(">>>TICKETS", tickets);
          })
        );
        break;
      }
      default:
        console.warn(`[play] can't execute ${currentNode.node} - not found`);
        break;
    }

    Promise.all(promises).then(() => {
      incrementTaskDone(dispatcher);
      const nextNode = getNodeById(currentNode.linksOutput[0], nodes);
      if (!nextNode) {
        resolve();
        return;
      } else {
        addLog(
          "play",
          "log",
          `go to next node ${nextNode.node}|${nextNode.id}`,
          null
        );
      }
      return executeANode(initialEvent, nextNode, nodes).then(() => {
        addLog(
          "play",
          "log",
          `node ${initialEvent.node}|${initialEvent.id} has terminated its flow`,
          null
        );
      });
    });
  });
};

const estimateTasks = (peers, iceEvents, readyEvent, nodes) => {
  let nbTasks = peers.length;

  // Count nodes for the ready Nodes
  if (readyEvent) {
    let currentNode = readyEvent.getNextNode(nodes);
    while (currentNode) {
      nbTasks += 1;
      currentNode = currentNode.getNextNode(nodes);
    }
  }

  // Count nodes for the ice Events Nodes
  iceEvents.forEach((iceEvent) => {
    let currentNode = iceEvent.getNextNode(nodes);
    while (currentNode) {
      nbTasks += 1;
      currentNode = currentNode.getNextNode(nodes);
    }
  });

  return nbTasks;
};

export const execute = (nodes, dispatch) => {
  return new Promise(async (resolve, reject) => {
    dispatcher = dispatch;

    addLog("play", "log", "started...", null);

    // found peer connections for creating iFrame
    const peers = filterNodesByName(NODES.PEER, nodes);
    const iceEvents = filterNodesByName(NODES.ICE, nodes);
    const readyEvent = findNodeByName(NODES.READY, nodes);

    // Estimate the number of task to do
    const numberOfTasks = estimateTasks(peers, iceEvents, readyEvent, nodes);
    setTaskNumber(numberOfTasks, dispatch);

    // Initialize Peer Connections
    for (const peer of peers) {
      const win = await createIFrame(peer);
      updateTitleInIFrame(win, peer.id);

      // Store iframe window context associated to a peer connection
      frames[peer.id] = win;

      // Create WatchRTC
      await createWatchRTC(peer, nodes);

      const stream = await createMedia(peer, nodes);
      const iceEventsForPeer = filterSimilarNodesById(
        peer.id,
        iceEvents,
        KEYS.PEER
      );
      const rtcPC = await createPeerConnection(
        peer,
        stream,
        iceEventsForPeer,
        nodes
      );

      monitorPeerConnection(
        rtcPC,
        peer.id,
        peer.getPropertyValueFor(KEYS.NAME),
        frames
      );

      // start Monitoring
      startMonitoring(peer.id, frames);

      incrementTaskDone(dispatch);
    }

    // Check for the ready event and execute it
    if (!readyEvent) {
      reject("No ready event");
      return;
    }

    // Start ready node in playground
    executeEventNode(readyEvent, nodes).then(() => {
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
    if (!object) {
      console.warn("can't rehydrate", name, kind);
    } else {
      object.rehydrate(node);
      model.push(object);
    }
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
