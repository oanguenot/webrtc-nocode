import Main from "../Main";
import { KEY_TYPE, KEYS, KIND, NODES } from "../../../modules/model";

class VideoAdjust extends Main {
  static item = "Adjust Video parameters";
  static description = "Parameterize the video track";
  static icon = "sliders-h";
  static section = "actions";
  static name = "VideoAdjust";

  constructor(x, y) {
    super(x, y);
    this._inputs = 1;
    this._outputs = 1;
    this._info = [
      { key: KEYS.NODE, value: NODES.ADJUST },
      { key: KEYS.KIND, value: KIND.VIDEO },
      {
        key: KEYS.INFO,
        value:
          "Parameterize the track. Equivalent to setParameters. Only work when in call",
      },
    ];
    this._acceptInputs = [NODES.EVENTS, NODES.ACTIONS];
    this._acceptOutputs = [NODES.ACTIONS];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: "Adjust Video",
        description: "Name of the adjustment",
      },
      {
        prop: KEYS.ACTIVE,
        label: "Active",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "Unchanged", value: "unchanged" },
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
        value: "unchanged",
        description: "Choose if the stream is active",
      },
      {
        prop: KEYS.MAX_BITRATE,
        label: "Max Bitrate",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "Unlimited", value: "unlimited" },
          { label: "2 Mbps", value: 2000000 },
          { label: "1,5 Mbps", value: 1500000 },
          { label: "1 Mbps", value: 1000000 },
          { label: "500 Kbps", value: 500000 },
          { label: "250 Kbps", value: 250000 },
          { label: "100 Kbps", value: 100000 },
        ],
        value: "unlimited",
        description: "Choose the maximum bitrate to use",
      },
      {
        prop: KEYS.MAX_FRAMERATE,
        label: "Max Framerate",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "Unlimited", value: "unlimited" },
          { label: "60 fps", value: 60 },
          { label: "30 fps", value: 30 },
          { label: "25 fps", value: 25 },
          { label: "20 fps", value: 20 },
          { label: "15 fps", value: 15 },
          { label: "12 fps", value: 12 },
          { label: "8 fps", value: 8 },
          { label: "5 fps", value: 5 },
          { label: "1 fps", value: 1 },
        ],
        value: "unlimited",
        description: "Choose the maximum framerate to use",
      },
      {
        prop: KEYS.TRACK,
        label: "Track",
        type: KEY_TYPE.ENUM,
        enum: [{ label: "None", value: "none" }],
        value: "none",
        description: "Choose the track to update",
      },
    ];
    this._sources = [`${KEYS.NAME}:${KEYS.TRACK}@${NODES.TRACK}`];
    this._targets = [];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);
    const label = this.getLabelFromPropertySelect(property);

    switch (prop) {
      case KEYS.NAME:
        return property.value;
      case KEYS.ACTIVE:
        return property.value;
      case KEYS.MAX_BITRATE:
        return property.value === "unlimited"
          ? "no rate limit"
          : `limited to ${label}`;
      case KEYS.MAX_FRAMERATE:
        return property.value === "unlimited"
          ? "no frames limit"
          : `limited to ${label}`;
      case KEYS.TRACK:
        return property.value === "none" ? "no track" : `${label}`;
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
            <i id="track-color-${this._uuid}" class="fas fa-video ${
      this.renderColorIsMissingProp(KEYS.TRACK) ? "red" : ""
    }"></i><span class="object-details-value ${
      this.renderColorIsMissingProp(KEYS.TRACK) ? "red" : ""
    }" id="track-${this._uuid}">${this.renderProp(KEYS.TRACK)}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="active-${
              this._uuid
            }">${this.renderProp(KEYS.ACTIVE)}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="maxBitrate-${
              this._uuid
            }">${this.renderProp(KEYS.MAX_BITRATE)}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-chevron-right"></i><span class="object-details-value" id="maxFramerate-${
              this._uuid
            }">${this.renderProp(KEYS.MAX_FRAMERATE)}</span>
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

export default VideoAdjust;
