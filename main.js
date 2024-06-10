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

crearVis3();

//Vis 1: Círculo

//Vis 2: Gráfico de barras agrupado

//Vis 3: Mapa de Calor: azúcar y valoración
//fuente: https://d3-graph-gallery.com/graph/heatmap_basic.html
//fuente: https://d3-graph-gallery.com/graph/heatmap_style.html



//something with dataset
function crearVis3() {
    d3.csv(CEREAL, d3.autoType).then(cereals => {
        console.log(cereals);
        const azucarMax = d3.max(cereals, d => d.sugars);

        //escala eje x
        const x3 = d3.scaleBand()
            .domain([0, azucarMax])
            .range([0, WIDTH_VIS_3])
            .padding(0.01); //from fuente, not sure what it does
        SVG3.append("g") //this part from fuente, revisa
            .attr("transform", `translate(0, ${HEIGHT_VIS_3})`)
            .call(d3.axisBottom(x3))

        //escala eje y
        const y3 = d3.scaleBand()
            .domain([0, 100]) //valoración porcentajes
            .range([HEIGHT_VIS_3, 0])
            .padding(0.01);
        SVG3.append("g")
            .call(d3.axisLeft(y3));

        //escala colores
        const colorMap = d3.scaleLinear()
            .domain([1,30]) //max number of cereals each box
            .range(["white", "#DA4167"])


        SVG3.selectAll("rect")
            .data(cereals)
            .join("rect")
            .attr("x", d => x3(d.sugars))
            .attr("y", d => y3(d.rating))
            .attr("width", x3.bandwidth())
            .attr("height", y3.bandwidth())
            .style("fill", d => colorMap(d.rating)); //this needs to be number of cereals in that bracket
        });
}
/*
*/