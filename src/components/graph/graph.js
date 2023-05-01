import Chart from "chart.js/auto";
import "chartjs-adapter-luxon";
import annotationPlugin from "chartjs-plugin-annotation";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";

Chart.register(annotationPlugin);

let charts = {};
let startTime = null;

export const CHART_COLORS = [
  "#dc3545",
  "#fd7e14",
  "#fd7e1452",
  "#eb8e40",
  "#ffd600",
  "#acc236",
  "#28a745",
  "#4dc9f6",
  "#537bc4",
  "#6f42c1",
  "#ccc",
  "#999",
  "#58595b",
  "#3a3b3c",
  "#2bffc6",
  "#11cdef",
  "#e14eca",
  "#8549ba",
  "#5603ad",
  "#000",
  "#795548",
];

const getDefaultConfig = () => ({
  type: "line",
  data: [],
  options: {
    plugins: {
      title: {
        display: false,
        text: "Metrics",
      },
      annotation: {
        annotations: {},
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "time",
        time: {
          tooltipFormat: "TT",
          displayFormats: {
            second: "TT",
          },
          unit: "second",
        },
        min: DateTime.now().minus({ second: 5 }).valueOf(),
        //max: DateTime.now().plus({ second: 5 }).valueOf(),
      },
      y: {
        type: "linear",
        min: 0,
      },
    },
  },
});

export const setStartTime = (time) => {
  startTime = time;
};

export const startTimeline = (chartId) => {
  if (charts[chartId]) {
    charts[chartId].config.options.scales.x.min =
      DateTime.fromJSDate(startTime).valueOf();
    charts[chartId].config.options.scales.x.max = DateTime.now()
      .plus({ second: 5 })
      .valueOf();
    charts[chartId].update();
  }
};

export const addAPICallToGraph = (series) => {
  let annotations = {};
  if (series) {
    series = series.filter(
      (event) =>
        event.name !== "addIceCandidate" &&
        event.name !== "setLocalDescription" &&
        event.name !== "setRemoteDescription" &&
        event.name !== "createOffer" &&
        event.name !== "createAnswer"
    );
    series.forEach((event) => {
      annotations[`${event.name}-${nanoid(4)}`] = {
        drawTime: "afterDatasetsDraw",
        type: "line",
        mode: "vertical",
        scaleID: "x",
        value: DateTime.fromJSDate(new Date(event.timestamp)).valueOf(),
        borderWidth: 1,
        borderColor: "red",
        label: {
          backgroundColor: "red",
          content: event.name,
          display: true,
          position: "start",
          font: {
            size: 11,
          },
        },
      };
    });
  }

  Object.keys(charts).forEach((chartId) => {
    if (charts[chartId]) {
      charts[chartId].config.options.plugins.annotation.annotations =
        annotations;
      charts[chartId].update();
    }
  });
};

export const createGraph = (peerId, canvas) => {
  if (!charts[peerId]) {
    charts[peerId] = new Chart(canvas, getDefaultConfig());
  }
};

export const destroyGraph = () => {
  Object.keys(charts).forEach((chartId) => {
    charts[chartId].destroy();
    delete charts[chartId];
  });
};

export const addSeries = (peerId, name, dataSeries) => {
  const existingSets = charts[peerId].data.datasets;

  // Check if series already exist
  const series = existingSets.find((set) => set.label === name);

  if (!series) {
    existingSets.push(createDataSeries(name, dataSeries));
  } else {
    series.data = dataSeries;
  }

  //  Adapt x timeline
  charts[peerId].config.options.scales.x.max = DateTime.now()
    .plus({ second: 5 })
    .valueOf();
  charts[peerId].update();
};

const createDataSeries = (name, data) => {
  const getRandomIntInclusive = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const color = CHART_COLORS[getRandomIntInclusive(0, CHART_COLORS.length - 1)];

  return {
    label: name,
    backgroundColor: color,
    borderColor: color,
    tension: 0.2,
    radius: 2,
    pointRadius: 2,
    data,
    type: "line",
  };
};
