const findLine = (sdpLines, prefix, substr)  => {
  return findLineInRange(sdpLines, 0, -1, prefix, substr);
};

const findLineInRange = (sdpLines, startLine, endLine, prefix, substr) => {
  const realEndLine = endLine !== -1 ? endLine : sdpLines.length;
  for (let i = startLine; i < realEndLine; ++i) {
    if (sdpLines[i].indexOf(prefix) === 0) {
      if (!substr ||
        sdpLines[i].toLowerCase().indexOf(substr.toLowerCase()) !== -1) {
        return i;
      }
    }
  }
  return null;
};

const splitLines = (blob) => {
  return blob.trim().split('\n').map(line => line.trim());
};

const joinLines = (lines) => {
  let str = lines.join("\r\n");
  str = `${str}\r\n`;
  return str;
}

const splitSections = (blob) => {
  const parts = blob.split('\nm=');
  return parts.map((part, index) => (index > 0 ?
    'm=' + part : part).trim() + '\r\n');
};

const getMediaSections = (blob) => {
  const sections = splitSections(blob);
  sections.shift();
  return sections;
};

const getVSection = (blob) => {
  const sections = splitSections(blob);
  return sections.shift();
};

const applyRRTR = (offer) => {
  const modifiedSections = [];

  const sections = getMediaSections(offer);
  sections.forEach((section, index) => {
    const lines = splitLines(section);
    const mLine = lines[0].split(' ');

    if(mLine) {
      mLine.forEach((codec, index) => {
        if(index >2) {
          lines.push(`a=rtcp-fb:${codec} rrtr`);
        }
      });
    }

    const newSection = joinLines(lines);
    modifiedSections.push(newSection);
  });

  return getVSection(offer).concat(modifiedSections.join(''));
}

export const mungle = (operation, offer) => {
  switch (operation) {
    case "rrtr":
      return applyRRTR(offer);
    default:
      return offer;
  }
}
