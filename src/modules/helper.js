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

export const peers = (nodes) => (nodes.filter(item => (item.node === "rtc.peer")));

export const ready = (nodes) => (nodes.find(item => (item.node === "event.ready")));
