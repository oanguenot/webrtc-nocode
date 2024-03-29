import Main from "../Main";
import { KEY_TYPE, KEYS, NODES } from "../../../modules/model";
import { generateCustomId4, getTURNCredentials } from "../../../modules/helper";

class Turn extends Main {
  static item = "Turn Server";
  static description = "Connect using a Turn Server";
  static icon = "bezier-curve";
  static section = "builtin";
  static name = "Turn";

  constructor(x, y) {
    super(x, y);
    this._inputs = 0;
    this._outputs = 0;
    this._acceptInputs = [];
    this._info = [
      { key: KEYS.NODE, value: NODES.TURN },
      {
        key: "info",
        value: "Configure a STUN and TURN server to use for any calls",
      },
    ];
    this._properties = [
      {
        prop: KEYS.NAME,
        label: "Name",
        type: KEY_TYPE.TEXT,
        value: `Turn-${generateCustomId4()}`,
        description: "Name of the Turn server",
        default: "Turn",
      },
      {
        prop: KEYS.STUNURL,
        label: "STUN Url",
        type: KEY_TYPE.TEXT,
        value: "",
        description: "URL of the STUN server",
      },
      {
        prop: KEYS.TURNURL,
        label: "TURN Url",
        type: KEY_TYPE.TEXT,
        value: "",
        description: "Url of the TURN server",
      },
      {
        prop: KEYS.TURNTOKEN,
        label: "TURN token",
        type: KEY_TYPE.TEXT,
        value: "",
        description: "Token used for authenticating users",
      },
    ];
    this._sources = [];
  }

  renderProp(prop) {
    const property = this.getPropertyFor(prop);

    switch (prop) {
      case KEYS.NAME:
        return property.value;
      case KEYS.STUNURL:
        return !!property.value.length
          ? `${property.value.substring(0, 18)}...`
          : "no STUN Url";
      case KEYS.TURNURL:
        return !!property.value.length
          ? `${property.value.substring(0, 18)}...`
          : "no TURN Url";
      case KEYS.TURNTOKEN:
        return !!property.value.length ? "*****" : "no token";
      default:
        return "";
    }
  }

  execute(userId) {
    return new Promise((resolve, reject) => {
      const stunUrl = this.getPropertyValueFor(KEYS.STUNURL);
      const turnUrl = this.getPropertyValueFor(KEYS.TURNURL);
      const turnToken = this.getPropertyValueFor(KEYS.TURNTOKEN);
      const { username, credential } = getTURNCredentials(
        `user#${userId}`,
        turnToken
      );

      const configuration = {
        iceServers: [],
        iceTransportPolicy: "all",
      };

      // Add all stun urls
      const urlsForStun = stunUrl.split(";");
      urlsForStun.forEach((url) => {
        if (url) {
          configuration.iceServers.push({ urls: url });
        }
      });

      const urlsForTurn = turnUrl.split(";");
      urlsForTurn.forEach((url) => {
        if (url) {
          configuration.iceServers.push({
            urls: url,
            username: username,
            credential: credential,
          });
        }
      });
      resolve(configuration);
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
            <i class="fas fa-at"></i><span class="object-details-value" id="stunurl-${
              this._uuid
            }">${this.renderProp(KEYS.STUNURL)}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-at"></i><span class="object-details-value" id="turnurl-${
              this._uuid
            }">${this.renderProp(KEYS.TURNURL)}</span>
            </div>
            <div class="object-box-line">
            <i class="fas fa-key"></i><span class="object-details-value" id="turntoken-${
              this._uuid
            }">${this.renderProp(KEYS.TURNTOKEN)}</span>
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

export default Turn;
