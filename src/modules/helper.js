import CryptoJS from "crypto-js";
import { customAlphabet } from "nanoid";

const CUSTOM_ALPHABET = "0123456789abcdef";
const nanoid = customAlphabet(CUSTOM_ALPHABET, 4);

export const getDimensionFromResolution = (resolution) => {
  switch (resolution) {
    case "480p":
      return { width: { ideal: 640 }, height: { ideal: 480 } };
    case "720p":
      return { width: { ideal: 1280 }, height: { ideal: 720 } };
    case "1080p":
      return { width: { ideal: 1920 }, height: { ideal: 1080 } };
    case "4k":
      return { width: { ideal: 3840 }, height: { ideal: 2160 } };
    default:
      return { width: { ideal: 640 }, height: { ideal: 480 } };
  }
};

export const includes = (nodeName, list) => {
  let found = false;
  list.forEach((item) => {
    if (item === nodeName || nodeName.includes(item)) {
      found = true;
    }
  });
  return found;
};

export const getNodeById = (id, nodes) => nodes.find((node) => node.id === id);

export const getNodesFromIds = (ids, nodes) =>
  ids.map((id) => getNodeById(id, nodes));

export const getNodeIndexById = (id, nodes) =>
  nodes.findIndex((object) => object.id === id);

export const getNodeInfoValue = (infoKey, node) => {
  const info = node._info;
  if (!info) {
    return null;
  }

  const infoName = info.find((item) => item.key === infoKey);
  return infoName ? infoName.value : null;
};

export const getNodeEnumLabelFromValue = (enumList, value) => {
  return enumList.find((item) => item.value === value);
};

export const filterSimilarNodesById = (id, nodes, key) => {
  return nodes.filter((node) => {
    const peerId = node.getPropertyValueFor(key);
    return peerId === id;
  });
};

export const filterNodesByName = (node, nodes, kind) => {
  if (kind) {
    return nodes.filter((item) => item.node === node && item.kind === kind);
  }
  return nodes.filter((item) => item.node === node);
};

export const findTargetsFromSources = (node, nodes, kind) => {
  const targets = [];
  nodes.forEach((nodeItem) => {
    const sources = nodeItem.sources.filter((source) =>
      source.includes(`@${node}`)
    );

    if (!!sources.length && (!kind || nodeItem.kind === kind)) {
      sources.forEach((source) => {
        targets.push({ node: nodeItem, source });
      });
    }
  });
  return targets;
};

export const findNodeByName = (node, nodes) => {
  return nodes.find((item) => item.node === node);
};

export const getTURNCredentials = (
  name,
  secret,
  turnUsername,
  turnPassword
) => {
  // First check if token is provided
  if (secret) {
    const unixTimeStamp = parseInt(Date.now() / 1000) + 24 * 3600; // this credential would be valid for the next 24 hours
    const username = [unixTimeStamp, name].join(":");
    const hmac = CryptoJS.HmacSHA1(username, secret);
    const credential = CryptoJS.enc.Base64.stringify(hmac);
    return {
      username,
      credential,
    };
  }

  // Second check if username and password are provided
  if (turnUsername && turnPassword) {
    return {
      username: turnUsername,
      credential: turnPassword,
    };
  }

  // else return empty credentials
  return {
    username: "",
    credential: "",
  };
};

export const getTransceiver = (transceivers, trackNodeId) => {
  // Try to find a transceiver from an existing track
  return transceivers.find((transceiver) => {
    const sender = transceiver.sender;
    if (!sender) {
      return false;
    }

    const track = sender.track;
    if (!track) {
      // If no track, try to find the transceiver from the sender
      return sender.__wp === trackNodeId;
    }
    return track.__wp === trackNodeId;
  });
};

export const getFirstEmptyTransceiver = (transceivers) => {
  // Find the first empty transceiver
  return transceivers.find((transceiver) => {
    const sender = transceiver.sender;
    if (!sender) {
      return false;
    }

    return sender.track ? false : true;
  });
}

export const stringify = (data) => {
  switch (data.constructor.name) {
    case "CanvasCaptureMediaStreamTrack":
    case "MediaStreamTrack":
      return `{${data.label}:${data.kind}, readyState=${data.readyState}, muted=${data.muted}, enabled=${data.enabled}, __private=${data.__wp}`;
    case "String":
      return `{${data}}`;
    default:
      return `${JSON.stringify(data)}`;
  }
};

export const displayNbPropsFromValue = (textContent) => {
  if (!textContent) {
    return "no property";
  }
  const values = textContent.split("\n");
  return values.length > 1 ? `${values.length} properties` : "1 property";
};

export const generateCustomId4 = () => {
  return nanoid(4);
};
