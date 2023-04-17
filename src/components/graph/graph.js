import Chart from "chart.js/auto";
import "chartjs-adapter-luxon";
import { DateTime } from "luxon";

let chart;

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
  "#fff",
  "#000",
  "#795548",
];

const config = {
  type: "line",
  data: [],
  options: {
    plugins: {
      title: {
        display: true,
        text: "Metrics",
      },
      autocolors: false,
      // annotation: {
      //       yMin: metricConfiguration.threshold.bad,
      //       yMax: metricConfiguration.threshold.bad,
      //       borderColor: CHART_COLORS.red,
      //       borderWidth: 2,
      //     },
      //     poor: {
      //       type: 'line',
      //       yMin: metricConfiguration.threshold.poor,
      //       yMax: metricConfiguration.threshold.poor,
      //       borderColor: CHART_COLORS.orange,
      //       borderWidth: 2,
      //     },
      //     good: {
      //       type: 'line',
      //       yMin: metricConfiguration.threshold.good,
      //       yMax: metricConfiguration.threshold.good,
      //       borderColor: CHART_COLORS.green,
      //       borderWidth: 2,
      //     },
      //   }
      // }
    },
    responsive: true,
    maintainAspectRatio: true,
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
        min: DateTime.now().plus({ second: 0 }).valueOf(),
        max: DateTime.now().plus({ second: 5 }).valueOf(),
      },
      y: {
        type: "linear",
        min: 0,
        max: 10,
      },
    },
  },
};

export const startTimeline = () => {
  if (chart) {
    chart.config.options.scales.x.min = DateTime.now().valueOf();
    chart.config.options.scales.x.max = DateTime.now()
      .plus({ second: 5 })
      .valueOf();
    chart.update();
  }
};

export const createGraph = (canvas) => {
  if (chart) {
    chart.destroy();
  }
  chart = new Chart(canvas, config);
};

export const addSeries = (name, dataSeries) => {
  const existingSets = chart.data.datasets;

  // Check if series already exist
  const series = existingSets.find((set) => set.label === name);

  if (!series) {
    existingSets.push(createDataSeries(name, dataSeries));
  } else {
    series.data = dataSeries;
  }

  let max = Math.max(...dataSeries.map((data) => data.y));
  // Add a 5% gap above
  max += (max * 5) / 100;
  chart.config.options.scales.y.max = Math.max(
    chart.config.options.scales.y.max,
    max
  );

  //  Adapt x timeline
  chart.config.options.scales.x.max = DateTime.now()
    .plus({ second: 5 })
    .valueOf();
  chart.update();
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
    tension: 0.5,
    radius: 2,
    pointRadius: 2,
    data,
    type: "line",
  };
};
