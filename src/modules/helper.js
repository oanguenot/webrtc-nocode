import {KEYS, NODES} from "./model";

export const getDimensionFromResolution = (resolution)  =>{
  switch (resolution) {
    case "480p":
      return {width: {ideal: 640}, height: {ideal: 480}};
    case "720p":
      return {width: {ideal: 1280}, height: {ideal: 720}};
    case "1080p":
      return {width: {ideal: 1920}, height: {ideal: 1080}};
    case "4k":
      return {width: {ideal: 3840}, height: {ideal: 2160}};
  }
}

export const includes = (nodeName, list) => {
  let found = false;
  list.forEach(item => {
    if(item === nodeName || nodeName.includes(item)) {
      found = true;
    }
  });
  return found;
}

export const getPeers = (nodes) => (nodes.filter(item => (item.node === NODES.PEER)));

export const getReady = (nodes) => (nodes.find(item => (item.node === NODES.READY)));

export const getIceChange = (nodes) => (nodes.filter(item => (item.node === NODES.ICE)));

export const getNodeById = (id, nodes) => (nodes.find((node) => (node.id === id)));

export const getNodeIndexById = (id, nodes) => (nodes.findIndex((object) => (object.id === id)));

export const getNodeInfoValue = (infoKey, node) => {
  const info = node._info;
  if(!info) {
    return null;
  }

  const infoName = info.find(item => item.key === infoKey);
  return infoName ? infoName.value : null;
}
