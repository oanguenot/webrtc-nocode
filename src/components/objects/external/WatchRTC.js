import Main from "../Main";
import { KEY_TYPE, KEYS, NODES } from "../../../modules/model";
import { customAlphabet } from "nanoid";

const CUSTOM_ALPHABET = "0123456789abcdef";
const nanoid = customAlphabet(CUSTOM_ALPHABET, 4);

class WatchRTC extends Main {
  static item = "WatchRTC";
  static description = "Analyze calls on testRTC platform";
  static icon = "ruler";
  static section = "builtin";
  static name = "WatchRTC";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 0;
    this._info = [
      { key: KEYS.NODE, value: NODES.WATCH },
      {
        key: KEYS.INFO,
        value:
          "Create a probe to analyze the data sent and received by this RTCPeerConnection",
      },
    ];
    this._acceptInputs = [NODES.PEER];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `Watch-${nanoid()}`,
        description: "Name of the tool",
      },
      {
        prop: "apiKey",
        label: "API Key",
        type: "text",
        value: "",
        description: "API Key to use",
      },
      {
        prop: "roomId",
        label: "Room ID",
        type: "text",
        value: `room-${nanoid(4)}`,
        description: "Name of the room",
      },
      {
        prop: KEYS.ACTIVE,
        label: "Active",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
        value: "yes",
        description: "Choose if watchRTC is active or not",
      },
    ];
    this._sources = [];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);

    switch (prop) {
      case KEYS.NAME:
        return property.value;
      case KEYS.ACTIVE:
        return property.value === "yes" ? "active" : "pause";
      case "apiKey":
        return property.value ? "*****" : "none";
      case "roomId":
        return property.value ? property.value : "no ID for room";
      default:
        return "";
    }
  }

  execute(win, rtcPeerId) {
    return new Promise((resolve, reject) => {
      try {
        // Don't activate watchRTC if paused
        const active = this.getPropertyValueFor("active");
        if (active === "no") {
          resolve();
          return;
        }

        const rtcApiKey = this.getPropertyValueFor("apiKey");
        const rtcRoomId = this.getPropertyValueFor("roomId");

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
            <i class="fas fa-key"></i><span class="object-details-value" id="apiKey-${
              this._uuid
            }">${this.renderProp("apiKey")}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-house-user"></i><span class="object-details-value" id="roomId-${
              this._uuid
            }">${this.renderProp("roomId")}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="active-${
              this._uuid
            }">${this.renderProp("active")}</span>
            </div>
             <div class="object-footer">
                <span class="object-node object-title-box">${this.node}
                </span>
            </div>
        </div>
      </div>
      `;
  }
}

export default WatchRTC;
