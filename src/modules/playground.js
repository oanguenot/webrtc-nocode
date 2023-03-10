import { customAlphabet } from "nanoid";
import {
  filterSimilarNodesById,
  filterNodesByName,
  findNodeByName,
  getDimensionFromResolution,
  getNodeById,
  getNodeInfoValue,
  getNodesFromIds,
} from "./helper";
import { KEYS, NODES } from "./model";
import { rehydrateObject } from "./builder";
import {
  addLog,
  addGroupToTimeline,
  resetTimeline,
  addEventToTimeline,
  addPeriodToTimeline,
  incrementTaskDone,
  setTaskNumber,
  addGroupToSubGroup,
} from "../actions/DebugActions";
import {
  addSubGroupInTempGroup,
  createTempGroup,
  createTempPeriod,
  endTempPeriod,
  hasPeriodFor,
} from "./timeline";

const frames = {};
let dispatcher = null;

const CUSTOM_ALPHABET = "0123456789abcdef";
const nanoid = customAlphabet(CUSTOM_ALPHABET, 6);

const getTransceiver = (transceivers, trackKind, trackDeviceId) => {
  const transceiver = transceivers.find((transceiver) => {
    const sender = transceiver.sender;
    if (!sender) {
      return false;
    }

    const track = sender.track;
    if (!track) {
      return false;
    }
    const constraints = track.getConstraints();
    return track.kind === trackKind && constraints.deviceId === trackDeviceId;
  });

  return transceiver;
};

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

const addMediaToElementInIFrame = (media) => {};

const createPeerConnection = (peerNode, stream, iceEvents, nodes) => {
  return new Promise(async (resolve, reject) => {
    const win = frames[peerNode.id];
    let intervalId = null;
    if (win) {
      win.pc = new win.RTCPeerConnection();
      win.ices = [];
      win.pc.oniceconnectionstatechange = () => {
        const state = win.pc.iceConnectionState;
        addLog(
          "peer",
          "log",
          `${peerNode.id} state changed to ${state}`,
          null,
          dispatcher
        );
        if (state === "connected") {
          const periodSetup = endTempPeriod(
            "setup-call",
            peerNode.id,
            Date.now()
          );
          addPeriodToTimeline(
            periodSetup.content,
            nanoid(),
            periodSetup.start,
            periodSetup.end,
            periodSetup.group,
            "background",
            dispatcher
          );
          createTempPeriod("in-call", peerNode.id, Date.now());
          intervalId = setInterval(() => {
            if (win.pc.iceConnectionState === "closed") {
              clearInterval(intervalId);
              const period = endTempPeriod("in-call", peerNode.id, Date.now());
              addPeriodToTimeline(
                period.content,
                nanoid(),
                period.start,
                period.end,
                period.group,
                "background",
                dispatcher
              );
            }
          }, 1000);
        } else if (
          state === "disconnected" ||
          state === "failed" ||
          state === "closed"
        ) {
          if (hasPeriodFor("setup-call", peerNode.id)) {
            const periodSetup = endTempPeriod(
              "setup-call",
              peerNode.id,
              Date.now()
            );
            addPeriodToTimeline(
              periodSetup.content,
              nanoid(),
              periodSetup.start,
              periodSetup.end,
              periodSetup.group,
              "background",
              dispatcher
            );
          }
          const period = endTempPeriod("in-call", peerNode.id, Date.now());
          addPeriodToTimeline(
            period.content,
            nanoid(),
            period.start,
            period.end,
            period.group,
            "background",
            dispatcher
          );
        }

        // Check iceEvents node to initiate actions
        iceEvents.forEach((eventNode) => {
          const eventState = eventNode.getPropertyValueFor(KEYS.ICESTATE);
          if (eventState === state) {
            executeEventNode(eventNode, nodes);
          }
        });
      };
      win.pc.onicecandidate = (event) => {
        win.ices.push(event.candidate);
      };
      win.pc.ontrack = (event) => {
        addLog(
          "peer",
          "log",
          `${peerNode.id} ontrack received ${event.track.kind}`,
          null,
          dispatcher
        );
        addGroupToSubGroup(
          `${event.track.kind}:${event.track.label}`,
          `${peerNode.id}-${event.track.id}`,
          peerNode.id,
          dispatcher
        );
        addEventToTimeline(
          "start-track",
          nanoid(),
          Date.now(),
          `${peerNode.id}-${event.track.id}`,
          "point",
          dispatcher
        );
        createMediaElementInIFrame(
          win,
          event.track.kind,
          event.track.id,
          false
        );
        const captured = new win.MediaStream();
        captured.addTrack(event.track);
        win.document.querySelector(`#remote-${event.track.id}`).srcObject =
          captured;
      };

      stream.getTracks().forEach((track) => {
        addLog(
          "peer",
          "log",
          `${peerNode.id} add track ${track.label} to ${peerNode.id}`,
          null,
          dispatcher
        );
        addGroupToSubGroup(
          `${track.kind}:${track.label}`,
          `${peerNode.id}-${track.id}`,
          peerNode.id,
          dispatcher
        );
        addEventToTimeline(
          "start-track",
          nanoid(),
          Date.now(),
          `${peerNode.id}-${track.id}`,
          "point",
          dispatcher
        );
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
          createMediaElementInIFrame(win, kind, deviceId);
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

const createWatchRTC = (peerNode, nodes) => {
  return new Promise((resolve, reject) => {
    try {
      const win = frames[peerNode.id];
      const outputNodes = getNodesFromIds(peerNode.linksOutput, nodes);
      const watchNode = findNodeByName(NODES.WATCH, outputNodes);

      if (!watchNode) {
        resolve();
        return;
      }

      const rtcApiKey = watchNode.getPropertyValueFor("apiKey");
      const rtcRoomId = watchNode.getPropertyValueFor("roomId");
      const rtcPeerId = watchNode.getPropertyValueFor("peerId");
      win.watchRTC.init({ rtcApiKey, rtcRoomId, rtcPeerId });
      resolve();
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

    createTempPeriod("setup-call", callerNode.id, Date.now());
    const offer = await callerWin.pc.createOffer();
    await callerWin.pc.setLocalDescription(offer);
    await delayer(10);
    createTempPeriod("setup-call", calleeNode.id, Date.now());
    await calleeWin.pc.setRemoteDescription(offer);

    callerWin.ices.forEach((ice) => calleeWin.pc.addIceCandidate(ice));
    const answer = await calleeWin.pc.createAnswer();
    await calleeWin.pc.setLocalDescription(answer);
    await delayer(10);
    await callerWin.pc.setRemoteDescription(answer);
    calleeWin.ices.forEach((ice) => callerWin.pc.addIceCandidate(ice));
    resolve();
  });
};

const encode = (peerNode, encodeNode, nodes) => {
  return new Promise((resolve, reject) => {
    const trackNodeId = encodeNode.getPropertyValueFor(KEYS.TRACK);
    const codecMimeType = encodeNode.getPropertyValueFor(KEYS.PREFERENCE);

    const trackNode = getNodeById(trackNodeId, nodes);
    const fromProperty = trackNode.getPropertyFor(KEYS.FROM);
    const trackLabel = trackNode.getLabelFromPropertySelect(fromProperty);
    const trackKind = trackNode.getInfoValueFor(KEYS.KIND);
    const trackDeviceId = trackNode.getPropertyValueFor(KEYS.FROM);

    const win = frames[peerNode.id];
    if (!win.pc) {
      console.log("Can't encode - no peer connection");
      resolve();
      return;
    }

    // Get transceiver and sender used
    const transceivers = win.pc.getTransceivers();
    const transceiver = getTransceiver(transceivers, trackKind, trackDeviceId);

    if (!transceiver) {
      resolve();
      return;
    }

    // Update codecs
    const { codecs } = RTCRtpSender.getCapabilities("video");
    const preferredCodecs = codecs.filter((codec) =>
      codec.mimeType.toLowerCase().includes(codecMimeType.toLowerCase())
    );
    const firstCodecIndex = codecs.findIndex((codec) =>
      codec.mimeType.toLowerCase().includes(codecMimeType.toLowerCase())
    );

    codecs.splice(firstCodecIndex, preferredCodecs.length);
    codecs.unshift(...preferredCodecs);
    transceiver.setCodecPreferences(codecs);
    addLog(
      "action",
      "log",
      `${encodeNode.id} encode track ${trackLabel} using ${codecMimeType}`,
      null,
      dispatcher
    );
    resolve();
  });
};

const adjust = (peerNode, encodeNode, nodes) => {
  return new Promise((resolve, reject) => {
    const trackNodeId = encodeNode.getPropertyValueFor(KEYS.TRACK);
    const maxBitrate = encodeNode.getPropertyValueFor(KEYS.MAX_BITRATE);
    const maxFramerate = encodeNode.getPropertyValueFor(KEYS.MAX_FRAMERATE);
    const active = encodeNode.getPropertyValueFor(KEYS.ACTIVE);

    const trackNode = getNodeById(trackNodeId, nodes);
    const fromProperty = trackNode.getPropertyFor(KEYS.FROM);
    const trackLabel = trackNode.getLabelFromPropertySelect(fromProperty);
    const trackKind = trackNode.getInfoValueFor(KEYS.KIND);
    const trackDeviceId = trackNode.getPropertyValueFor(KEYS.FROM);

    const win = frames[peerNode.id];
    if (!win.pc) {
      console.log("Can't encode - no peer connection");
      resolve();
      return;
    }

    // Get transceiver and sender used
    const transceivers = win.pc.getTransceivers();
    const transceiver = getTransceiver(transceivers, trackKind, trackDeviceId);
    if (!transceiver) {
      resolve();
      return;
    }

    // Change active flags
    const sender = transceiver.sender;
    if (!sender) {
      resolve();
      return;
    }
    const parameters = sender.getParameters();

    const newParameters = { ...parameters };
    const encodings = newParameters.encodings[0];
    if (!encodings) {
      console.warn("[encode] no encodings found");
      resolve();
      return;
    }

    let parameter = ``;
    if (active !== "unchanged") {
      encodings.active = active === "yes";
      parameter += `encoding=${active}`;
    }
    if (maxBitrate > -1) {
      encodings.maxBitrate = maxBitrate;
      parameter += `,maxbitrate=${maxBitrate}`;
    }
    if (maxFramerate > -1) {
      encodings.maxFramerate = maxFramerate;
      parameter += `,maxframerate=${maxFramerate}`;
    }

    sender
      .setParameters(newParameters)
      .then(() => {
        addEventToTimeline(
          "set-parameters",
          nanoid(),
          Date.now(),
          "playground",
          "point",
          dispatcher
        );
        addLog(
          "action",
          "log",
          `${encodeNode.id} parameterize track with ${parameter}`,
          null,
          dispatcher
        );
        resolve();
      })
      .catch((err) => {
        console.warn("[encode] error", err);
        resolve();
      });
  });
};

const endPlayground = () => {
  return new Promise((resolve, reject) => {
    Object.keys(frames).forEach((key) => {
      addLog("play", "log", `clean frame ${key}`, null, dispatcher);
      const winFrame = frames[key];
      if (winFrame.pc) {
        winFrame.pc.close();
      }
      if (winFrame.stream) {
        winFrame.stream.getTracks().forEach((track) => track.stop());
      }
    });
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
      null,
      dispatcher
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
    null,
    dispatcher
  );
  return new Promise((resolve, reject) => {
    const promises = [];
    switch (currentNode.node) {
      case NODES.CALL: {
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
      }
      case NODES.WAIT: {
        const delay = currentNode.getPropertyValueFor(KEYS.DELAY);
        promises.push(delayer(delay));
        break;
      }
      case NODES.ENCODE: {
        const fromPeer = getNodeById(
          initialEvent.getPropertyValueFor("peer"),
          nodes
        );
        promises.push(encode(fromPeer, currentNode, nodes));
        break;
      }
      case NODES.ADJUST: {
        const fromPeer = getNodeById(
          initialEvent.getPropertyValueFor("peer"),
          nodes
        );
        promises.push(adjust(fromPeer, currentNode, nodes));
        break;
      }
      case NODES.END: {
        promises.push(endPlayground());
        break;
      }
      default:
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
          null,
          dispatcher
        );
      }
      return executeANode(initialEvent, nextNode, nodes).then(() => {
        addLog(
          "play",
          "log",
          `node ${initialEvent.node}|${initialEvent.id} has terminated its flow`,
          null,
          dispatcher
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

    // Reset Timeline
    resetTimeline(dispatch);

    addGroupToTimeline("playground", "playground", dispatcher);
    addEventToTimeline(
      "start",
      nanoid(),
      Date.now(),
      "playground",
      "point",
      dispatcher
    );

    addLog("play", "log", "started...", null, dispatcher);
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

      addGroupToTimeline(
        peer.getPropertyValueFor(KEYS.NAME),
        peer.id,
        dispatcher
      );
      //createTempGroup(peer.getPropertyValueFor(KEYS.NAME), peer.id);

      // Store iframe window context associated to a peer connection
      frames[peer.id] = win;
      await createWatchRTC(peer, nodes);
      const stream = await createMedia(peer, nodes);
      const iceEventsForPeer = filterSimilarNodesById(
        peer.id,
        iceEvents,
        KEYS.PEER
      );
      await createPeerConnection(peer, stream, iceEventsForPeer, nodes);
      incrementTaskDone(dispatch);
    }

    // Check for the ready event and execute it
    if (!readyEvent) {
      addLog(
        "play",
        "warning",
        "Ready node is missing from the playground",
        null,
        dispatcher
      );
      reject("No ready event");
    }
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
