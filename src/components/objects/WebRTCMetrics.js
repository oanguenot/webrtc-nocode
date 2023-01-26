import Main from "./Main";
import { nanoid } from "nanoid";

class WebRTCMetrics extends Main {
  constructor(x, y) {
    super(x, y);
    this._icon = "user";
    this._inputs = 1;
    this._outputs = 0;
    this._info = [{ key: "node", value: "webrtcmetrics" }];
    this._accept = ["user"];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: `WebRTCMetrics`,
        description: "Name of the tool",
      },
      {
        prop: "metrics",
        label: "Metrics collected",
        type: "enum",
        enum: [
          { label: "All", value: "all" },
          { label: "Only events", value: "events" },
          { label: "Only passthrough", value: "passthrough" },
        ],
        value: "all",
        description: "Choose the metrics to collect",
      },
      {
        prop: "exporter",
        label: "Exporter",
        type: "enum",
        enum: [
          { label: "File", value: "file" },
          { label: "Screen", value: "screen" },
        ],
        value: "screen",
        description: "Choose where to store the metrics",
      },
    ];
  }

  render() {
    const item = `
      <div>
        <div class="title-box">
          <i class="fas fa-${this._icon}"></i> <span id="name-${this._uuid}">${this._properties[0].value}</span>
        </div>
      </div>
      `;
    return item;
  }
}

export default WebRTCMetrics;
