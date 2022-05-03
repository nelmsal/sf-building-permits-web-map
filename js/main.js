/* eslint-disable dot-notation */
const apiHost = 'http://localhost:3000';
// const apiHost = 'https://philly-trail-waze.herokuapp.com';

/**
npm install
npx eslint exercise
npx http-server --port 3000
npm install -g localhost
localhost -p 3000
npm install -g serve
npx serve .
*/

const map = L.map('map').setView([37.758667, -122.440071], 12.25);

let mbAccessToken = 'pk.eyJ1IjoibmVsbXMiLCJhIjoiY2wycWZldnQ0MDA0cTNscGE0bmdwZW1qNiJ9.WAtQnoSeY6VaN38L5X-lEA';
let mbID = 'nelms';
let mbStyle = 'cl2qgn76n000r15och2qhmsw8';
// MONOCHROME LIGHT GREY LABELS
L.tileLayer(`https://api.mapbox.com/styles/v1/${mbID}/${mbStyle}/tiles/256/{z}/{x}/{y}?access_token=${mbAccessToken}`, {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// COLOR FUNCTIONS
var colors = [];
var bins = [];

let getColors = (cmap, n) => colorbrewer[cmap][n];

let getColorBins = (column, binLength, cmap) => {
    cmap = cmap || valueBins[column].cmap;
    colors = getColors(cmap, binLength);
    return colors;
};

let getBinIndex = (bins, value) => {
    for (let i = 0; i <= bins.length; i++) {
      if (bins[i] > value) {
        return i-1;
      }
    }
    return 0;
  };

let getValueColor = (value, column) => {
    bins = valueBins[column].bins;
    colors = getColorBins(column, bins.length-1);
    let binIndex = getBinIndex(bins, value);
    return colors[binIndex];
};

// LAYER FUNCTIONS
let valueColumn = "units.tot.15_19";
let metricsLayer = null;

const loadMetrics = function () {
  fetch(`${apiHost}/data/sf_permit_metrics.geojson`)
    .then(resp => resp.json())
    .then(data => {
      test = data;
      metricsLayer = L.geoJSON(data, {
        style: metricStyle,
      });
      metricsLayer.bindTooltip(l => l.feature.properties['geoid10'], { sticky: true });
      metricsLayer.addTo(map);
    });
};

let metricStyle = (feature) => ({
  weight: 6,
  opacity: 0,
  fillOpacity: 0.7,
  // color: feature.properties.map_color,
  fillColor: getValueColor(feature.properties[valueColumn], valueColumn),
});

loadMetrics()

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    let labels = [];
    var from, to;

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < bins.length; i++) {
			from = bins[i];
			to = bins[i + 1];

			labels.push(
				'<i style="background:' + colors[from + 1] + '"></i> ' +
				from + (to ? '&ndash;' + to : '+'));
		}

		div.innerHTML = labels.join('<br>');
		return div;
};

legend.addTo(map);