const CEREAL = "cereal.csv"; //is this how u link a file?

const SVG1 = d3.select("#vis-1").append("svg");
const SVG2 = d3.select("#vis-2").append("svg");
const SVG3 = d3.select("#vis-3").append("svg");

// Podemos editar tamaños dsp
const WIDTH_VIS_1 = 800;
const HEIGHT_VIS_1 = 400;

const WIDTH_VIS_2 = 800;
const HEIGHT_VIS_2 = 400;

const WIDTH_VIS_3 = 800;
const HEIGHT_VIS_3 = 400;

SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);
SVG2.attr("width", WIDTH_VIS_2).attr("height", HEIGHT_VIS_2);
SVG3.attr("width", WIDTH_VIS_3).attr("height", HEIGHT_VIS_3);

//Vis 1: Círculo

//Vis 2: Gráfico de barras agrupado

//Vis 3: Mapa de Calor
