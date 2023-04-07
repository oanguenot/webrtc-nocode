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
import { mungle } from "./sdp";

const frames = {};
let dispatcher = null;

const getTransceiver = (transceivers, trackNodeId) => {
  return transceivers.find((transceiver) => {
    const sender = transceiver.sender;
    if (!sender) {
      return false;
    }

    const track = sender.track;
    if (!track) {
      return false;
    }
    return track.__wp === trackNodeId;
  });
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
  return new Promise(async (resolve, _reject) => {
    const win = frames[peerNode.id];

    await peerNode.execute(
      win,
      peerNode,
      stream,
      iceEvents,
      turnsConfiguration,
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
  return new Promise((resolve, reject) => {
    try {
      const win = frames[peerNode.id];
      const outputNodes = getNodesFromIds(peerNode.linksOutput, nodes);
      const watchNode = findNodeByName(NODES.WATCH, outputNodes);

      if (!watchNode) {
        resolve();
        return;
      }

      // Don't activate watchRTC if paused
      const active = watchNode.getPropertyValueFor("active");
      if (active === "no") {
        resolve();
        return;
      }

      const rtcApiKey = watchNode.getPropertyValueFor("apiKey");
      const rtcRoomId = watchNode.getPropertyValueFor("roomId");
      // Use the property name from peer as the peerId
      const rtcPeerId = peerNode.getPropertyValueFor("name");

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
            username: null,
            credential: null,
          });
        }
      });

      // Store each Turn configuration
      turnsConfiguration[turnNode.id] = configuration;
    });

    resolve(turnsConfiguration);
  });
};

const mungleSDP = (mungleNode, peerNode, offer) => {
  return new Promise((resolve, reject) => {
    addCustomEvent(peerNode.id, frames, "mungle", "playground", "", new Date());
    const operation = mungleNode.getPropertyValueFor(KEYS.OPERATION);
    const updatedOffer = mungle(operation, offer);
    resolve(updatedOffer);
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
      rtcOfferSessionDescription.sdp = await mungleSDP(
        munglerNode,
        callerNode,
        rtcOfferSessionDescription.sdp
      );
    }

    await callerWin.pc.setLocalDescription(rtcOfferSessionDescription);
    const ices = await waitForIce(callerWin.pc, callerNode.id);

    await calleeWin.pc.setRemoteDescription(rtcOfferSessionDescription);
    const rtcAnswerSessionDescription = await calleeWin.pc.createAnswer();

    if (munglerId) {
      const munglerNode = getNodeById(munglerId, nodes);
      rtcAnswerSessionDescription.sdp = await mungleSDP(
        munglerNode,
        callerNode,
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

const encode = (encodeNode, nodes) => {
  return new Promise((resolve, reject) => {
    const trackNodeId = encodeNode.getPropertyValueFor(KEYS.TRACK);
    const codecMimeType = encodeNode.getPropertyValueFor(KEYS.PREFERENCE);

    const trackNode = getNodeById(trackNodeId, nodes);
    const fromProperty = trackNode.getPropertyFor(KEYS.FROM);
    const trackLabel = trackNode.getLabelFromPropertySelect(fromProperty);
    const trackKind = trackNode.getInfoValueFor(KEYS.KIND);
    const trackDeviceId = trackNode.getPropertyValueFor(KEYS.FROM);

    // Deduce peer node from track node
    const peerId = trackNode.linksOutput[0];
    const peerNode = getNodeById(peerId, nodes);

    const win = frames[peerNode.id];
    if (!win.pc) {
      resolve();
      return;
    }

    // Get transceiver and sender used
    const transceivers = win.pc.getTransceivers();

    const transceiver = getTransceiver(transceivers, trackNodeId);

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

    addCustomEvent(
      peerNode.id,
      frames,
      "encode",
      "playground",
      `${encodeNode.id} encode track ${trackLabel} using ${codecMimeType}`,
      new Date()
    );
    resolve();
  });
};

const adjust = (encodeNode, nodes) => {
  return new Promise((resolve, reject) => {
    const trackNodeId = encodeNode.getPropertyValueFor(KEYS.TRACK);
    const maxBitrate = encodeNode.getPropertyValueFor(KEYS.MAX_BITRATE);
    const maxFramerate = encodeNode.getPropertyValueFor(KEYS.MAX_FRAMERATE);
    const active = encodeNode.getPropertyValueFor(KEYS.ACTIVE);

    const trackNode = getNodeById(trackNodeId, nodes);
    const fromProperty = trackNode.getPropertyFor(KEYS.FROM);
    const trackKind = trackNode.getInfoValueFor(KEYS.KIND);
    const trackDeviceId = trackNode.getPropertyValueFor(KEYS.FROM);

    // Deduce peer node from track node
    const peerId = trackNode.linksOutput[0];
    const peerNode = getNodeById(peerId, nodes);

    const win = frames[peerNode.id];
    if (!win.pc) {
      console.log("Can't adjust - no peer connection");
      resolve();
      return;
    }

    // Get transceiver and sender used
    const transceivers = win.pc.getTransceivers();
    const transceiver = getTransceiver(transceivers, trackNodeId);
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
      console.warn("[adjust] no encodings found");
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
        addCustomEvent(
          peerNode.id,
          frames,
          "set-parameters",
          "playground",
          `${encodeNode.id} parameterize track with ${parameter}`,
          new Date()
        );
        resolve();
      })
      .catch((err) => {
        console.warn("[encode] error", err);
        resolve();
      });
  });
};

const restartIce = (peerNode, callNode, currentNode, nodes) => {
  return new Promise((resolve, reject) => {
    const win = frames[peerNode.id];
    if (!win.pc) {
      console.log("Can't restartIce - no peer connection");
      resolve();
      return;
    }

    const calleeId = callNode.getPropertyValueFor(KEYS.RECIPIENT);
    const calleeNode = getNodeById(calleeId, nodes);

    win.pc.addEventListener(
      "negotiationneeded",
      async () => {
        await call(peerNode, calleeNode, callNode, nodes);
        resolve();
      },
      { once: true }
    );

    // Restart ICE
    win.pc.restartIce();
    addCustomEvent(
      peerNode.id,
      frames,
      "restart-ice",
      "playground",
      "",
      new Date()
    );
  });
};

const endPlayground = () => {
  return new Promise((resolve, reject) => {
    Object.keys(frames).forEach((key) => {
      addCustomEvent(key, frames, "close", "playground", "", new Date());
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
        // ticket.call.events.forEach((event) => {
        //     const getValueToDisplay = (name, value) => {
        //       switch (name) {
        //         case "size-up":
        //           return `&#x2197; ${value}`;
        //         case "size-down":
        //           return `&#x2198; ${value}`;
        //         case "fps-up":
        //           return `&#x2191; ${value} fps`;
        //         case "fps-down":
        //           return `&#x2193; ${value} fps`;
        //         case "limitation":
        //         default:
        //           return `&#8474; ${value}`;
        //       }
        //     };
        // });
        console.log(">>>TICKET", ticket);
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
        const callerId = currentNode.getPropertyValueFor(KEYS.CALLER);
        const fromPeer = getNodeById(callerId, nodes);
        const recipientId = currentNode.getPropertyValueFor(KEYS.RECIPIENT);
        const recipientPeer = getNodeById(recipientId, nodes);

        if (recipientPeer && fromPeer) {
          promises.push(call(fromPeer, recipientPeer, currentNode, nodes));
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
        promises.push(encode(currentNode, nodes));
        break;
      }
      case NODES.ADJUST: {
        promises.push(adjust(currentNode, nodes));
        break;
      }
      case NODES.RESTARTICE: {
        const peerId = currentNode.getPropertyValueFor(KEYS.PEER);
        const peerNode = getNodeById(peerId, nodes);
        const callId = currentNode.getPropertyValueFor(KEYS.CALL);
        const callNode = getNodeById(callId, nodes);
        promises.push(restartIce(peerNode, callNode, currentNode, nodes));
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
