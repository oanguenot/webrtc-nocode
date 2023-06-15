import Main from "../Main";
import { KEY_TYPE, KEYS, NODES } from "../../../modules/model";
import { generateCustomId4, getNodeById } from "../../../modules/helper";

class CallP2P extends Main {
  static item = "CallP2P";
  static description = "Call P2P";
  static icon = "phone-volume";
  static section = "actions";
  static name = "CallP2P";

  constructor(x, y) {
    super(x, y);
    this._inputs = 2;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.CALL },
      {
        key: KEYS.INFO,
        value: "Initiate a P2P call to a recipient by sending an offer",
      },
    ];
    this._acceptInputs = [NODES.EVENTS, NODES.ACTIONS, NODES.MUNGING];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `Call-${generateCustomId4()}`,
        description: "Action/Name",
        default: "Call",
      },
      {
        prop: KEYS.CALLER,
        label: "Caller",
        type: KEY_TYPE.ENUM,
        enum: [{ label: "None", value: "none" }],
        value: "none",
        description: "Choose the RTCPeerConnection to call",
      },
      {
        prop: KEYS.RECIPIENT,
        label: "Recipient",
        type: KEY_TYPE.ENUM,
        enum: [{ label: "None", value: "none" }],
        value: "none",
        description: "Choose the RTCPeerConnection to call",
      },
      {
        prop: KEYS.DELAY,
        label: "Delay",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "Immediate", value: 0 },
          { label: "Low latency (100ms)", value: 100 },
          { label: "Medium latency (500ms)", value: 500 },
          { label: "High latency (1s)", value: 1000 },
          { label: "Very High latency (3s)", value: 3000 },
        ],
        value: 0,
        description: "Delay to wait before sending message to recipient",
      },
    ];
    this._sources = [
      `${KEYS.NAME}:${KEYS.CALLER}@${NODES.PEER}`,
      `${KEYS.NAME}:${KEYS.RECIPIENT}@${NODES.PEER}`,
    ];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case KEYS.DELAY:
        return property.value === "0"
          ? "No latency"
          : `Latency of ${property.value}`;
      case KEYS.NAME:
        return property.value;
      case KEYS.CALLER:
        if (property.value === "none") {
          return "No caller";
        }
        return `[${label}]`;
      case KEYS.RECIPIENT:
        if (property.value === "none") {
          return "No recipient";
        }
        return `[${label}]`;
      default:
        return "";
    }
  }

  execute(
    nodes,
    frames,
    reporter,
    callback,
    invertedCall = false,
    withICENegotiation = true
  ) {
    return new Promise(async (resolve, reject) => {
      const waitForIce = (peer, _id) => {
        return new Promise((resolve, _reject) => {
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

      const options = {
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
      };

      const callerId = this.getPropertyValueFor(KEYS.CALLER);
      let callerNode = getNodeById(callerId, nodes);
      const recipientId = this.getPropertyValueFor(KEYS.RECIPIENT);
      let calleeNode = getNodeById(recipientId, nodes);

      if (!callerNode || !calleeNode) {
        console.warn("Can't call - no caller or callee");
        reject();
        return;
      }

      if (invertedCall) {
        console.warn("inversed call - due to restart Ice done in recipient");
        const tmpNode = callerNode;
        callerNode = calleeNode;
        calleeNode = tmpNode;
      }

      const callerWin = frames[callerNode.id];
      const calleeWin = frames[calleeNode.id];
      if (!callerWin || !calleeWin || !callerWin.pc || !calleeWin.pc) {
        console.warn("Can't call - can't find frames or pc");
        reject();
      }

      const munglerId = this.linksInput.find((inputId) => {
        const inputNode = getNodeById(inputId, nodes);
        return inputNode.node === NODES.MUNGING;
      });

      let rtcOfferSessionDescription = await callerWin.pc.createOffer(options);

      if (munglerId) {
        const munglerNode = getNodeById(munglerId, nodes);
        rtcOfferSessionDescription.sdp = await munglerNode.execute(
          callerNode.id,
          frames,
          rtcOfferSessionDescription.sdp,
          reporter
        );
      }

      reporter({
        win: callerWin,
        name: "createOffer",
        category: "api",
        details: "Create the local offer",
        timestamp: Date.now(),
        ssrc: null,
        data: rtcOfferSessionDescription.sdp,
        ended: null,
      });

      await callerWin.pc.setLocalDescription(rtcOfferSessionDescription);

      reporter({
        win: callerWin,
        name: "setLocalDescription",
        category: "api",
        details: "Set the local offer to the local RTCPeerConnection",
        timestamp: Date.now(),
        ssrc: null,
        data: rtcOfferSessionDescription.sdp,
        ended: null,
      });

      let callerIces = null;
      if (withICENegotiation) {
        callerIces = await waitForIce(callerWin.pc, callerNode.id);
      }

      await calleeWin.pc.setRemoteDescription(rtcOfferSessionDescription);

      reporter({
        win: calleeWin,
        name: "setRemoteDescription",
        category: "api",
        details: "Set the local offer to the remote RTCPeerConnection",
        timestamp: Date.now(),
        ssrc: null,
        data: rtcOfferSessionDescription.sdp,
        ended: null,
      });

      const rtcAnswerSessionDescription = await calleeWin.pc.createAnswer();

      if (munglerId) {
        const munglerNode = getNodeById(munglerId, nodes);
        rtcAnswerSessionDescription.sdp = await munglerNode.execute(
          calleeNode.id,
          frames,
          rtcAnswerSessionDescription.sdp,
          reporter
        );
      }

      reporter({
        win: calleeWin,
        name: "createAnswer",
        category: "api",
        details: "Create the remote answer",
        timestamp: Date.now(),
        ssrc: null,
        data: rtcAnswerSessionDescription.sdp,
        ended: null,
      });

      await calleeWin.pc.setLocalDescription(rtcAnswerSessionDescription);

      reporter({
        win: calleeWin,
        name: "setLocalDescription",
        category: "api",
        details: "Set the remote answer to the remote RTCPeerConnection",
        timestamp: Date.now(),
        ssrc: null,
        data: rtcAnswerSessionDescription.sdp,
        ended: null,
      });

      let calleeIces = null;
      if (withICENegotiation) {
        calleeIces = await waitForIce(calleeWin.pc, calleeNode.id);
      }

      if (callerIces) {
        callerIces.forEach((ice) => {
          calleeWin.pc.addIceCandidate(ice);

          reporter({
            win: calleeWin,
            name: "addIceCandidate",
            category: "api",
            details: "Add a local candidate to the remote RTCPeerConnection",
            timestamp: Date.now(),
            ssrc: null,
            data: ice,
            ended: null,
          });
        });
      }

      await callerWin.pc.setRemoteDescription(rtcAnswerSessionDescription);

      reporter({
        win: callerWin,
        name: "setRemoteDescription",
        category: "api",
        details: "Set the remote answer to the local RTCPeerConnection",
        timestamp: Date.now(),
        ssrc: null,
        data: rtcAnswerSessionDescription.sdp,
        ended: null,
      });

      if (calleeIces) {
        calleeIces.forEach((ice) => {
          callerWin.pc.addIceCandidate(ice);

          reporter({
            win: callerWin,
            name: "addIceCandidate",
            category: "api",
            details: "Add a remote candidate to the local RTCPeerConnection",
            timestamp: new Date(),
            ssrc: null,
            data: ice,
            ended: null,
          });
        });
      }

      resolve();
    });
  }

  render() {
    return `
      <div>
        <div class="title-box">
          <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${
      this._uuid
    }">${this.renderProp("name")}</span>
        </div>
        <div class="box">
         <div class="object-box-line">
            <i id="caller-color-${this._uuid}" class="fas fa-portrait ${
      this.renderColorIsMissingProp(KEYS.CALLER) ? "red" : ""
    }"></i><span class="object-details-value ${
      this.renderColorIsMissingProp(KEYS.CALLER) ? "red" : ""
    }" id="caller-${this._uuid}">${this.renderProp(KEYS.CALLER)}</span>
            </div>
            <div class="object-box-line">
            <i id="recipient-color-${this._uuid}" class="fas fa-portrait ${
      this.renderColorIsMissingProp(KEYS.RECIPIENT) ? "red" : ""
    }"></i><span class="object-details-value ${
      this.renderColorIsMissingProp(KEYS.RECIPIENT) ? "red" : ""
    }" id="recipient-${this._uuid}">${this.renderProp(KEYS.RECIPIENT)}</span>
            </div>
        <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="delay-${
              this._uuid
            }">${this.renderProp(KEYS.DELAY)}</span>
            </div>
            <div class="object-footer">
                <span class="object-node object-title-box">${
                  this.node
                }</span>    
            </div>
        </div>
      </div>
    `;
  }
}

export default CallP2P;
