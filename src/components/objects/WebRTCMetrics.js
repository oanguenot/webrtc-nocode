import Main from "./Main";

class WebRTCMetrics extends Main {
  static item = "WebRTC Metrics";
  static description = "Analyze call metrics";
  static icon = "ruler";
  static section = "builtin";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 0;
    this._info = [
      { key: "node", value: "rtc.analysis" },
      {
        key: "info",
        value:
          "Create a probe to analyze the data sent and received by this RTCPeerConnection",
      },
    ];
    this._acceptInputs = ["rtc.peer"];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: `WebRTCMetrics`,
        description: "Name of the tool",
      },
      {
        prop: "start",
        label: "Start",
        type: "enum",
        enum: [
          { label: "Immediately", value: 0 },
          { label: "After 1 second", value: 1000 },
          { label: "After 2 seconds", value: 2000 },
          { label: "After 3 seconds", value: 3000 },
          { label: "After 5 seconds", value: 5000 },
        ],
        value: 0,
        description: "Choose the metrics to collect",
      },
      {
        prop: "every",
        label: "Refresh every",
        type: "enum",
        enum: [
          { label: "1 second", value: 1000 },
          { label: "2 seconds", value: 2000 },
          { label: "3 seconds", value: 3000 },
          { label: "5 seconds", value: 5000 },
          { label: "8 seconds", value: 8000 },
          { label: "10 seconds", value: 10000 },
          { label: "15 seconds", value: 15000 },
        ],
        value: 2000,
        description: "Choose the metrics to collect",
      },
      {
        prop: "metrics",
        label: "Metrics collected",
        type: "enum",
        enum: [
          { label: "All", value: "all" },
          { label: "Inbound streams", value: "inbound" },
          { label: "Outbound streams", value: "outbound" },
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
          { label: "Console", value: "console" },
        ],
        value: "console",
        description: "Choose where to store the metrics",
      },
    ];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case "name":
        return property.value;
      case "start":
        return `start ${label.toLowerCase()}`;
      case "every":
        return `refresh ${label.toLowerCase()}`;
      case "metrics":
        return property.value === "all"
          ? "report all metrics"
          : `${label.toLowerCase()}`;
      case "exporter":
        return `saved in ${label.toLowerCase()}`;
    }
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
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="start-${
              this._uuid
            }">${this.renderProp("start")}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="every-${
              this._uuid
            }">${this.renderProp("every")}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="metrics-${
              this._uuid
            }">${this.renderProp("metrics")}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="exporter-${
              this._uuid
            }">${this.renderProp("exporter")}</span>
            </div>
             <div class="object-footer">
                <span class="object-node object-title-box">${
                  this._info[0].value
                }.${this._uuid}
                </span>    
            </div>
        </div>
      </div>
      `;
  }
}

export default WebRTCMetrics;
