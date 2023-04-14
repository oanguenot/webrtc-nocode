import Main from "../Main";
import { KEY_TYPE, KEYS, NODES } from "../../../modules/model";
import { customAlphabet } from "nanoid";
import { configuration } from "../../../modules/metrics";
import { findNodeByName, getNodesFromIds } from "../../../modules/helper";

const CUSTOM_ALPHABET = "0123456789abcdef";
const nanoid = customAlphabet(CUSTOM_ALPHABET, 4);

class WebRTCMetrics extends Main {
  static item = "Metrics";
  static description = "Analyze WebRTC metrics live";
  static icon = "ruler";
  static section = "builtin";
  static name = "WebRTCMetrics";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 0;
    this._info = [
      { key: KEYS.NODE, value: NODES.ANALYZE },
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
        value: `Metrics-${nanoid()}`,
        description: "Name of the tool",
      },
      {
        prop: KEYS.INBOUND,
        label: "Inbound",
        type: KEY_TYPE.TEXTAREA,
        value: "bytesReceived",
        description: "Choose the metrics to collect for inbound tracks",
      },
      {
        prop: KEYS.OUTBOUND,
        label: "Outbound",
        type: KEY_TYPE.TEXTAREA,
        value: "bytesSent",
        description: "Choose the metrics to collect for outbound tracks",
      },
    ];
    this._sources = [];
  }

  renderProp(prop) {
    const displayNbPropsFromValue = (value) => {
      const values = property.value.split("\n");
      return values.length > 1
        ? `${values.length} properties`
        : values.length === 1
        ? "1 property"
        : "no property";
    };

    const property = this.getPropertyFor(prop);

    switch (prop) {
      case KEYS.NAME:
        return property.value;
      case KEYS.INBOUND:
        return displayNbPropsFromValue(property.value);
      case KEYS.OUTBOUND:
        return displayNbPropsFromValue(property.value);
      default:
        return "";
    }
  }

  execute(win, nodes) {
    return new Promise((resolve, reject) => {
      const inputNodes = getNodesFromIds(this.linksOutput, nodes);
      const peerNode = findNodeByName(NODES.PEER, inputNodes);

      win.metrics = new win.WebRTCMetrics(configuration);
      win.probe = win.metrics.createProbe(win.pc, {
        pname: peerNode.getPropertyValueFor(KEYS.NAME),
        uid: peerNode.id,
        ticket: true,
        record: false,
      });

      win.metrics.startAllProbes();
    });
  }

  render() {
    return `
      <div>
        <div class="title-box">
          <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${
      this._uuid
    }">${this.renderProp(KEYS.NAME)}</span>
        </div>
         <div class="box">
            <div class="object-box-line">
            <i class="fas fa-long-arrow-alt-left"></i><span class="object-details-value" id="inbound-${
              this._uuid
            }">${this.renderProp(KEYS.INBOUND)}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-long-arrow-alt-right"></i><span class="object-details-value" id="outbound-${
              this._uuid
            }">${this.renderProp(KEYS.OUTBOUND)}</span>
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

export default WebRTCMetrics;
