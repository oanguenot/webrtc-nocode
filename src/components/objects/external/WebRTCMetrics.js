import Main from "../Main";
import { KEY_TYPE, KEYS, NODES } from "../../../modules/model";
import { configuration } from "../../../modules/metrics";
import {
  displayNbPropsFromValue,
  findNodeByName,
  generateCustomId4,
  getNodesFromIds,
} from "../../../modules/helper";
import { addPointsInGraph } from "../../../actions/DebugActions";

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
        value: `Metrics-${generateCustomId4()}`,
        description: "Name of the tool",
        default: "Metrics",
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

  execute(win, nodes, dispatch) {
    return new Promise((resolve, reject) => {
      const inputNodes = getNodesFromIds(this.linksInput, nodes);
      const peerNode = findNodeByName(NODES.PEER, inputNodes);

      const inbound = this.getPropertyValueFor(KEYS.INBOUND).split("\n");
      const outbound = this.getPropertyValueFor(KEYS.OUTBOUND).split("\n");
      const remoteInbound = [];
      const remoteOutbound = [];

      // Manage roundTripTime, jitter, packetsLost, fractionLost in remote-inbound
      ["roundTripTime", "jitter", "packetsLost", "fractionLost"].forEach(
        (property) => {
          const index = outbound.findIndex((elt) => elt.includes(property));
          if (index > -1) {
            const removed = outbound.splice(index, 1);
            remoteInbound.push(removed[0]);
          }
        }
      );

      // Manage roundTripTime in remote-outbound
      ["roundTripTime"].forEach((property) => {
        const index = inbound.findIndex((elt) => elt.includes(property));
        if (index > -1) {
          const removed = inbound.splice(index, 1);
          remoteOutbound.push(removed[0]);
        }
      });

      win.metrics = new win.WebRTCMetrics(configuration);
      win.probe = win.metrics.createProbe(win.pc, {
        pname: peerNode.getPropertyValueFor(KEYS.NAME),
        uid: peerNode.id,
        ticket: true,
        record: false,
        passthrough: {
          "inbound-rtp": inbound,
          "outbound-rtp": outbound,
          "remote-inbound-rtp": remoteInbound,
          "remote-outbound-rtp": remoteOutbound,
          transport: ["ps:bytesSent.kbits", "ps:bytesReceived.kbits"],
        },
      });

      win.probe.onreport = (report) => {
        // Do something with a report collected (JSON)
        addPointsInGraph(
          peerNode.id,
          report.passthrough,
          report.timestamp,
          dispatch
        );
      };

      win.metrics.startAllProbes();
      resolve();
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
