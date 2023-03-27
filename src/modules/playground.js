import { customAlphabet } from "nanoid";
import {
  filterSimilarNodesById,
  filterNodesByName,
  findNodeByName,
  getDimensionFromResolution,
  getNodeById,
  getNodeInfoValue,
  getNodesFromIds,
  getTURNCredentials,
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
  addGroupsToSubGroup,
  addEventsToTimeline,
} from "../actions/DebugActions";
import { createTempPeriod, endTempPeriod, hasPeriodFor } from "./timeline";
import {
  monitorPeerConnection,
  startMonitoring,
  stopMonitoring,
} from "./metrics";

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
    const settings = track.getSettings();
    const capabilities = track.getCapabilities();
    if (trackDeviceId !== "[default]") {
      return track.kind === trackKind && constraints.deviceId === trackDeviceId;
    } else {
      return track.kind === trackKind;
    }
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

const createPeerConnection = (
  peerNode,
  stream,
  iceEvents,
  turnsConfiguration,
  nodes
) => {
  return new Promise(async (resolve, reject) => {
    const win = frames[peerNode.id];
    let intervalId = null;
    if (win) {
      const turnId = peerNode.getPropertyValueFor(KEYS.TURN);
      const network = peerNode.getPropertyValueFor(KEYS.NETWORK);
      const configuration = turnsConfiguration
        ? turnsConfiguration[turnId]
        : null;
      if (configuration) {
        if (network === "relay") {
          configuration.iceTransportPolicy = "relay";
        }
        win.pc = new win.RTCPeerConnection(configuration);
      } else {
        win.pc = new win.RTCPeerConnection();
      }
      win.ices = [];
      win.pc.addEventListener("iceconnectionstatechange", () => {
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
      });
      win.pc.addEventListener("track", (event) => {
        addLog(
          "peer",
          "log",
          `${peerNode.id} ontrack received ${event.track.kind}`,
          null,
          dispatcher
        );
        addEventToTimeline(
          "start-track",
          "",
          nanoid(),
          Date.now(),
          `${peerNode.id}-${event.ssrc}`,
          "box",
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
      });

      stream.getTracks().forEach((track) => {
        addLog(
          "peer",
          "log",
          `${peerNode.id} add track ${track.label} to ${peerNode.id}`,
          null,
          dispatcher
        );
        addEventToTimeline(
          "start-track",
          "",
          nanoid(),
          Date.now(),
          `${peerNode.id}-${track.id}`,
          "point",
          dispatcher
        );
        win.pc.addTrack(track);
      });
    }
    resolve(win.pc);
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
            if (deviceId !== "none") {
              constraints.audio = {
                channelCount,
              };
              if (deviceId !== "[default]") {
                constraints.audio.deviceId = { exact: deviceId };
              }
            }
          } else {
            const framerate = input.getPropertyValueFor("framerate");
            const resolution = input.getPropertyValueFor("resolution");
            const dimension = getDimensionFromResolution(resolution);
            if (deviceId !== "none") {
              constraints.video = {
                framerate,
                width: dimension.width,
                height: dimension.height,
              };
              if (deviceId !== "[default]") {
                constraints.video.deviceId = { exact: deviceId };
              }
            }
          }
          // Create media element in IFrame
          createMediaElementInIFrame(win, kind, inputId);
          const captured = await win.navigator.mediaDevices.getUserMedia(
            constraints
          );
          win.document.querySelector(`#local-${inputId}`).srcObject = captured;
          captured.getTracks().forEach((track) => win.stream.addTrack(track));
        }
      }
      resolve(win.stream);
    } catch (err) {
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
      //const collectionInterval = 5;
      win.watchRTC.init({
        rtcApiKey,
        rtcRoomId,
        rtcPeerId,
      });
      resolve();
    } catch (err) {
      reject(err);
    }
  });
};

const createTurnConfiguration = (turns, peerId) => {
  return new Promise((resolve, reject) => {
    if (!turns.length) {
      resolve();
      return;
    }

    const turnsConfiguration = {};

    turns.forEach((turnNode) => {
      const stunUrl = turnNode.getPropertyValueFor(KEYS.STUNURL);
      const turnUrl = turnNode.getPropertyValueFor(KEYS.TURNURL);
      const turnToken = turnNode.getPropertyValueFor(KEYS.TURNTOKEN);

      const user = getTURNCredentials(`user#${peerId}`, turnToken);

      const configuration = {
        iceServers: [],
        iceTransportPolicy: "all",
      };

      // Add all stun urls
      const urlsForStun = stunUrl.split(";");
      urlsForStun.forEach((url) => {
        if (url) {
          configuration.iceServers.push({ urls: url });
        }
      });

      const urlsForTurn = turnUrl.split(";");
      urlsForTurn.forEach((url) => {
        if (url) {
          configuration.iceServers.push({
            urls: url,
            username: user.username,
            credential: user.credential,
          });
        }
      });

      // Store each Turn configuration
      turnsConfiguration[turnNode.id] = configuration;
    });

    resolve(turnsConfiguration);
  });
};

const call = (callerNode, calleeNode, callNode) => {
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

    createTempPeriod("setup-call", callerNode.id, Date.now());
    const offer = await callerWin.pc.createOffer();
    await callerWin.pc.setLocalDescription(offer);
    const ices = await waitForIce(callerWin.pc, callerNode.id);

    createTempPeriod("setup-call", calleeNode.id, Date.now());
    await calleeWin.pc.setRemoteDescription(offer);
    const answer = await calleeWin.pc.createAnswer();
    await calleeWin.pc.setLocalDescription(answer);

    const calleeIces = await waitForIce(calleeWin.pc, calleeNode.id);
    ices.forEach((ice) => calleeWin.pc.addIceCandidate(ice));

    await callerWin.pc.setRemoteDescription(answer);
    calleeIces.forEach((ice) => callerWin.pc.addIceCandidate(ice));
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
    addEventToTimeline(
      "encode",
      "",
      nanoid(),
      Date.now(),
      `playground`,
      "point",
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
          "",
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

      // Stop monitoring
      const ticket = stopMonitoring(key, frames);
      if (ticket) {
        const subGroups = [];
        const events = [];
        ticket.call.events.forEach((event) => {
          if (event.category === "quality") {
            const getValueToDisplay = (name, value) => {
              switch (name) {
                case "size-up":
                  return `&#x2197; ${value}`;
                case "size-down":
                  return `&#x2198; ${value}`;
                case "fps-up":
                  return `&#x2191; ${value} fps`;
                case "fps-down":
                  return `&#x2193; ${value} fps`;
                case "limitation":
                default:
                  return `&#8474; ${value}`;
              }
            };

            events.push({
              content: getValueToDisplay(event.name, event.details.value),
              title: "",
              id: nanoid(),
              start: event.at,
              group: `${key}-${event.ssrc}`,
              type: "box",
            });
          } else if (event.name === "track-added") {
            subGroups.push({
              content: `ssrc_${event.ssrc}_${event.details.kind}-${
                event.details.direction.includes("in") ? "in" : "out"
              }`,
              id: `${key}-${event.ssrc}`,
              groupId: key,
            });
          }
        });

        addGroupsToSubGroup(subGroups, dispatcher);
        addEventsToTimeline(events, dispatcher);
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
      "",
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
    const turns = filterNodesByName(NODES.TURN, nodes);

    // Estimate the number of task to do
    const numberOfTasks = estimateTasks(peers, iceEvents, readyEvent, nodes);
    setTaskNumber(numberOfTasks, dispatch);

    // Create Turn Configuration
    const turnsConfiguration = await createTurnConfiguration(turns);

    // Initialize Peer Connections
    for (const peer of peers) {
      const win = await createIFrame(peer);
      updateTitleInIFrame(win, peer.id);

      addGroupToTimeline(
        peer.getPropertyValueFor(KEYS.NAME),
        peer.id,
        dispatcher
      );

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
        turnsConfiguration,
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
      addLog(
        "play",
        "warning",
        "Ready node is missing from the playground",
        null,
        dispatcher
      );
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
