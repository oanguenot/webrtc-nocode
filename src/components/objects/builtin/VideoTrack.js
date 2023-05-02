import Main from "../Main";
import { KEY_TYPE, KEYS, KIND, NODES } from "../../../modules/model";
import { generateCustomId4 } from "../../../modules/helper";

class VideoTrack extends Main {
  static item = "Video Track";
  static description = "Add a video source from a fake device";
  static icon = "video";
  static section = "builtin";
  static name = "VideoTrack";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 1;
    this._acceptInputs = [];
    this._info = [
      { key: KEYS.NODE, value: NODES.TRACK },
      { key: KEYS.KIND, value: KIND.VIDEO },
      {
        key: KEYS.INFO,
        value: "Get the MediaStreamTrack instance from the selected device",
      },
    ];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `${KIND.VIDEO}-${generateCustomId4()}`,
        description: "Choose the preferred microphone",
        default: KIND.VIDEO,
      },
      {
        prop: KEYS.FROM,
        label: "From",
        type: KEY_TYPE.ENUM,
        enum: [
          { label: "None", value: "none" },
          { label: "Null", value: "null" },
          { label: "Fake", value: "[fake]" },
          { label: "Movie 576p", value: "576p" },
          { label: "Movie 720p", value: "720p" },
          { label: "Movie 1080p", value: "1080p" },
          { label: "Movie 4k", value: "4k" },
        ],
        value: "[fake]",
        description: "Choose the preferred camera",
      },
    ];
    this._sources = [];
  }

  // Don't use real devices
  // This function has been desactivated
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
      case KEYS.NAME:
        return property.value;
      case KEYS.FROM:
        if(property.value === "none") {
          return `[${label}]`;
        } else if(property.value === "null") {
          return `[Empty]`;
        }
        return label;
      default:
        return "";
    }
  }

  execute(win) {
    return new Promise(async (resolve, reject) => {
      const getVideoTrack = (width, height, r, g, b) => {
        return new Promise((resolve, reject) => {
          const canvas = Object.assign(win.document.createElement("canvas"), {
            width,
            height,
          });

          const ctx = canvas.getContext("2d");
          ctx.fillRect(0, 0, width, height);
          const p = ctx.getImageData(0, 0, width, height);
          const draw = () => {
            for (let i = 0; i < p.data.length; i++) {
              const color = Math.random() * 255;
              p.data[i++] = color * r;
              p.data[i++] = color * g;
              p.data[i++] = color * b;
            }
            ctx.putImageData(p, 0, 0);
            requestAnimationFrame(draw);
          };
          requestAnimationFrame(draw);
          const videoStream = canvas.captureStream();
          resolve(videoStream.getVideoTracks()[0]);
        });
      };

      const getVideoFromPlayer = async (resolution) => {
        return new Promise((resolve, reject) => {
          const video = win.document.createElement("video");
          video.setAttribute("loop", true);
          video.addEventListener("loadedmetadata", () => {
            console.log(
              `local video videoWidth: ${video.videoWidth}px,  videoHeight: ${video.videoHeight}px`
            );
          });

          video.addEventListener("resize", () => {
            console.log(
              `Local video size changed to ${video.videoWidth}x${video.videoHeight}`
            );
          });

          video.src = `./${resolution}.mp4`;
          video
            .play()
            .then(() => {
              const stream = video.captureStream();
              const [track] = stream.getVideoTracks();
              resolve(track);
            })
            .catch((err) => {
              console.warn("[videotrack] can't capture stream", err);
              resolve(null);
            });
        });
      };

      let videoTrack = null;
      try {
        const videoType = this.getPropertyValueFor(KEYS.FROM);
        switch (videoType) {
          case "[fake]":
            videoTrack = await getVideoTrack(96, 64, 0, 1, 0);
            break;
          case "576p":
          case "720p":
          case "1080p":
          case "4k":
            videoTrack = await getVideoFromPlayer(videoType);
            break;
          case "null":
            // Don't return any track
            break;
          default:
            break;
        }

        const stream = new win.MediaStream();
        if (videoTrack) {
          videoTrack.__wp = this.id;
          stream.addTrack(videoTrack);
        }
        resolve(stream);
      } catch (err) {
        console.log(`[IFRAME] :: error got stream ${err.toString()}`);
        reject(videoTrack);
      }
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
                <i class="fas fa-play"></i><span class="object-details-value" id="from-${
                  this._uuid
                }">${this.renderProp(KEYS.FROM)}</span>
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

export default VideoTrack;
