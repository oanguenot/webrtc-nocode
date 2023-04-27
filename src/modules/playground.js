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
  addGraphEvent,
  addLog,
  incrementTaskDone,
  setTaskNumber,
  terminate,
} from "../actions/DebugActions";
import { createTempPeriod, endTempPeriod, hasPeriodFor } from "./timeline";
import { addCustomEvent, addCustomEventWithObject } from "./metrics";

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

export const resetExecute = () => {
  return new Promise((resolve, reject) => {
    addLog("play", "log", `reset frames`, null);

    Object.keys(frames).forEach((id) => {
      const iframe = document.querySelector(`#${id}`);
      if (iframe) {
        iframe.parentNode.removeChild(iframe);
      }
      delete frames[id];
    });
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

const createPeerConnection = (peerNode, stream, iceEvents, nodes, dispatch) => {
  return new Promise(async (resolve, _reject) => {
    const win = frames[peerNode.id];

    await peerNode.execute(
      win,
      peerNode,
      stream,
      iceEvents,
      nodes,
      async (eventNode, nodes) => {
        return executeANode(eventNode, eventNode, nodes);
      },
      createMediaElementInIFrame,
      dispatch
    );
    resolve();
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

const executeANode = (initialEvent, currentNode, nodes) => {
  addLog(
    "play",
    "log",
    `execute node ${currentNode.node}|${currentNode.id}`,
    null
  );
  return new Promise((resolve, reject) => {
    const reporter = async (object) => {
      addCustomEventWithObject(object);
      if (object.category === "api") {
        await addGraphEvent(object.name, object.timestamp, dispatcher);
      }
    };

    currentNode.execute(nodes, frames, reporter).then(async (results) => {
      incrementTaskDone(dispatcher);

      const nextNode = getNodeById(currentNode.linksOutput[0], nodes);
      if (!nextNode) {
        addLog(
          "play",
          "log",
          `node ${initialEvent.node}|${initialEvent.id} has terminated its flow`,
          null
        );

        if (currentNode.node === NODES.END) {
          terminate(results, dispatcher);
        }
        resolve();
      } else {
        addLog(
          "play",
          "log",
          `go to next node ${nextNode.node}|${nextNode.id}`,
          null
        );
        return executeANode(initialEvent, nextNode, nodes);
      }
    });
  });
};

const estimateTasks = (peers, iceEvents, readyEvent, nodes) => {
  let nbTasks = peers.length;

  // Count nodes for the ready Nodes
  if (readyEvent) {
    nbTasks += 1;
    let currentNode = readyEvent.getNextNode(nodes);
    while (currentNode) {
      nbTasks += 1;
      currentNode = currentNode.getNextNode(nodes);
    }
  }

  // Count nodes for the ice Events Nodes
  iceEvents.forEach((iceEvent) => {
    nbTasks += 1;
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

      await createPeerConnection(
        peer,
        stream,
        iceEventsForPeer,
        nodes,
        dispatch
      );

      incrementTaskDone(dispatch);
    }

    // Check for the ready event and execute it
    if (!readyEvent) {
      reject("No ready event");
      return;
    }

    // Start ready node in playground
    await executeANode(readyEvent, readyEvent, nodes);
    resolve();
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
