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
