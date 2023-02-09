import Main from "./Main";

class VideoTrack extends Main {
  static item = "Video Track";
  static description = "Add a video source from a webcam";
  static icon = "video";
  static section = "builtin";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 1;
    this._acceptInputs = [];
    this._acceptOutputs = ["rtc.peer"];
    this._info = [
      { key: "node", value: "rtc.track" },
      { key: "kind", value: "video" },
    ];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: "Video Track",
        description: "Name of the track",
      },
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
          { label: "2K", value: "2k" },
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
            value: mediaDevice.label,
          });
        }
      }
    });
  }

  render() {
    const device = this.getPropertyFor("from");
    const label = this.getLabelFromPropertySelect(device);
    const resolution = this.getPropertyFor("resolution");
    const labelResolution = this.getLabelFromPropertySelect(resolution);
    const framerate = this.getPropertyFor("framerate");
    const labelFramerate = this.getLabelFromPropertySelect(framerate);

    const item = `
     <div>
        <div class="title-box">
           <i class="fas fa-${this.constructor.icon}"></i> <span id="name-${this._uuid}">${this._properties[0].value}</span>
        </div>
        <div class="box">
        <div class="object-box-line">
          <i class="fas fa-chevron-right"></i><span class="object-details-value">${label}</span>
        </div>
        <div class="object-box-line">
          <i class="fas fa-chevron-right"></i><span class="object-details-value">${labelResolution} at ${labelFramerate}</span>
        </div>
          <div class="object-footer">
            <span class="object-node object-title-box">${this._info[0].value}</span>    
          </div>
        </div>
      </div>
      `;
    return item;
  }
}

export default VideoTrack;
