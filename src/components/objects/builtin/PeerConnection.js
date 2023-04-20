import Main from "../Main";

import "../Main.css";
import { KEY_TYPE, KEYS, NODES } from "../../../modules/model";
import {
  findNodeByName,
  generateCustomId4,
  getNodeById,
  getNodesFromIds,
  stringify,
} from "../../../modules/helper";
import { addCustomEvent } from "../../../modules/metrics";

class PeerConnection extends Main {
  static item = "Peer Connection";
  static description = "Create a new peer connection";
  static icon = "portrait";
  static section = "builtin";
  static name = "PeerConnection";

  constructor(x, y) {
    super(x, y);
    this._inputs = 2;
    this._outputs = 1;
    this._acceptInputs = [NODES.TRACK];
    this._acceptOutputs = [NODES.WATCH, NODES.ANALYZE];
    this._info = [
      { key: KEYS.NODE, value: NODES.PEER },
      {
        key: KEYS.INFO,
        value: "Create a new RTCPeerConnection instance for a user",
      },
    ];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `Peer-${generateCustomId4()}`,
        description: "Name of the Peer Connection",
        default: "Peer",
      },
      {
        prop: KEYS.TURN,
        label: "Use STUN/TURN",
        type: KEY_TYPE.ENUM,
        enum: [{ label: "No, local only", value: "local" }],
        value: "local",
        description: "Select the TURN server to use",
      },
      {
        prop: KEYS.NETWORK,
        label: "Connection type",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "Unforced", value: "unforced" },
          { label: "Relay only", value: "relay" },
        ],
        value: "unforced",
        description: "Choose the connection type to use",
      },
    ];
    this._sources = [`${KEYS.NAME}:${KEYS.TURN}@${NODES.TURN}`];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case KEYS.NETWORK:
        return property.value === "any" ? "Unforced network" : label;
      case KEYS.NAME:
        return property.value;
      case KEYS.TURN:
        return property.value === "local" ? "Local only" : `[${label}]`;
      default:
        return "";
    }
  }

  execute(
    win,
    peerNode,
    stream,
    iceEvents,
    nodes,
    callback,
    createMediaElementInIFrame,
    dispatch
  ) {
    return new Promise(async (resolve, reject) => {
      if (win) {
        const turnId = peerNode.getPropertyValueFor(KEYS.TURN);
        const network = peerNode.getPropertyValueFor(KEYS.NETWORK);

        // create and configure the peer connection
        let configuration = null;
        if (turnId !== "local") {
          const turnNode = getNodeById(turnId, nodes);
          configuration = await turnNode.execute(peerNode.id);
          if (network === "relay") {
            configuration.iceTransportPolicy = "relay";
          }
        }

        if (configuration) {
          win.pc = new win.RTCPeerConnection(configuration);
        } else {
          win.pc = new win.RTCPeerConnection();
        }

        // Manage the outputs
        const outputNodes = getNodesFromIds(peerNode.linksOutput, nodes);
        const watchNode = findNodeByName(NODES.WATCH, outputNodes);
        const metricsNode = findNodeByName(NODES.ANALYZE, outputNodes);

        if (watchNode) {
          const rtcPeerId = peerNode.getPropertyValueFor("name");
          await watchNode.execute(win, rtcPeerId);
        }

        if (metricsNode) {
          await metricsNode.execute(win, nodes, dispatch);
        }

        addCustomEvent(
          win,
          "RTCPeerConnection",
          "api",
          "Create the new RTCPeerConnection",
          new Date(),
          null,
          { configuration }
        );

        win.ices = [];
        win.pc.addEventListener("iceconnectionstatechange", () => {
          const state = win.pc.iceConnectionState;

          // Check iceEvents node to initiate actions
          iceEvents.forEach((eventNode) => {
            const eventState = eventNode.getPropertyValueFor(KEYS.ICESTATE);
            if (eventState === state) {
              callback(eventNode, nodes);
            }
          });
        });

        win.pc.addEventListener("track", (event) => {
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
          addCustomEvent(
            win,
            "addTrack",
            "api",
            "Add Track to RTCPeerConnection",
            new Date(),
            null,
            stringify(track)
          );

          win.pc.addTrack(track);
          // win.pc.addTransceiver(track, {
          //   sendEncodings: [
          //     { rid: "q", scaleResolutionDownBy: 4.0, scalabilityMode: "L1T3" },
          //     { rid: "h", scaleResolutionDownBy: 2.0, scalabilityMode: "L1T3" },
          //     { rid: "f", scalabilityMode: "L1T3" },
          //   ],
          // });
        });
      }
      resolve();
    });
  }

  render() {
    const item = `
      <div>
        <div class="title-box">
           <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${
      this._uuid
    }">${this.renderProp(KEYS.NAME)}</span>
        </div>
        <div class="box">
          <div class="object-box-line">
              <i class="fas fa-bezier-curve"></i><span class="object-details-value" id="turn-${
                this._uuid
              }">${this.renderProp(KEYS.TURN)}</span>
          </div>
          <div class="object-box-line">
              <i class="fas fa-chevron-right"></i> <span class="object-details-value" id="network-${
                this._uuid
              }">${this.renderProp(KEYS.NETWORK)}</span>
          </div>
          <div class="object-footer">
                  <span class="object-node object-title-box">${
                    this.node
                  }</span>    
          </div>
        </div>
      </div>
      `;
    return item;
  }
}

export default PeerConnection;
