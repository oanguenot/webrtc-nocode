import Main from "./Main";

class VideoTrack extends Main {
  static item = "Video Track";
  static description = "Add a video source from a webcam";
  static icon = "video";
  static section = "builtin";
  static name = "VideoTrack";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 1;
    this._acceptInputs = [];
    this._acceptOutputs = ["rtc.peer"];
    this._info = [
      { key: "node", value: "rtc.track" },
      { key: "kind", value: "video" },
      {
        key: "info",
        value: "Get the MediaStreamTrack instance from the selected device",
      },
    ];
    this._properties = [
      {
        prop: "from",
        label: "From",
        type: "enum",
        enum: [{ label: "Fake", value: "fake" }],
        value: "fake",
        description: "Choose the preferred camera",
      },
      {
        prop: "framerate",
        label: "Framerate",
        type: "enum",
        enum: [
          { label: "1 fps", value: 1 },
          { label: "6 fps", value: 5 },
          { label: "12 fps", value: 12 },
          { label: "24 fps", value: 24 },
          { label: "30 fps", value: 30 },
          { label: "60 fps", value: 60 },
        ],
        value: 30,
        description: "Number of frames per second",
      },
      {
        prop: "resolution",
        label: "Resolution",
        type: "enum",
        enum: [
          { label: "480p", value: "480p" },
          { label: "HD", value: "720p" },
          { label: "Full HD", value: "1080p" },
          { label: "4K", value: "4k" },
        ],
        value: "720p",
        description: "Choose a resolution",
      },
    ];
  }

  addDevices(list) {
    const prop = this._properties.find((property) => property.prop === "from");
    const existingDevices = prop.enum;
    list.forEach((mediaDevice) => {
      if (mediaDevice.kind === "videoinput") {
        const found = existingDevices.find((device) =>
          [mediaDevice.label].includes(device.label)
        );
        if (!found) {
          existingDevices.push({
            label: mediaDevice.label,
            value: mediaDevice.deviceId,
          });
        }
      }
    });
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case "from":
        return label;
      case "framerate":
        return `At ${label}`;
      case "resolution":
        return `${label}`;
      default:
        return "";
    }
  }

  render() {
    return `
     <div>
        <div class="title-box">
           <i class="fas fa-${this.constructor.icon}"></i> <span id="from-${
      this._uuid
    }">${this.renderProp("from")}</span>
        </div>
        <div class="box">
          <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="resolution-${
              this._uuid
            }">${this.renderProp("resolution")}</span>
          </div>
          <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="framerate-${
              this._uuid
            }">${this.renderProp("framerate")}</span>
          </div>
          <div class="object-footer">
            <span class="object-node object-title-box">${this._info[0].value}.${
              this._uuid
            }</span>    
          </div>
        </div>
      </div>
      `;
  }
}

export default VideoTrack;
