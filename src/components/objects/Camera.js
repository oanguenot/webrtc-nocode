import Main from "./Main";

class Camera extends Main {
  constructor(x, y) {
    super(x, y);
    this._icon = "video";
    this._inputs = 0;
    this._outputs = 1;
    this._info = [
      { key: "node", value: "camera" },
      { key: "kind", value: "videoinput" },
      { key: "type", value: "real" },
    ];
    this._properties = [
      {
        prop: "name",
        label: "Name",
        type: "text",
        value: "Camera",
        description: "Name of the Camera",
      },
      {
        prop: "framerate",
        label: "Framerate",
        type: "enum",
        enum: [1, 10, 24, 30, 60],
        value: 30,
        description: "Number of frames per second",
      },
      {
        prop: "resolution",
        label: "Resolution",
        type: "enum",
        enum: ["480p", "720p", "1080p", "2k", "4k"],
        value: "720p",
        description: "Resolution of the camera",
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

export default Camera;
