const CEREAL = "cereal.csv";

const WIDTH_VIS_1 = 1000;
const HEIGHT_VIS_1 = 1000;
const WIDTH_VIS_2 = 1000;
const HEIGHT_VIS_2 = 800;
const WIDTH_VIS_3 = 800;
const HEIGHT_VIS_3 = 400;

const SVG1 = d3.select("#vis-1").append("svg")
    .attr("width", "100%")
    .attr("height", "100%");
const SVG2 = d3.select("#vis-2").append("svg");
const SVG3 = d3.select("#vis-3").append("svg");

SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);
SVG2.attr("width", WIDTH_VIS_2).attr("height", HEIGHT_VIS_2);
SVG3.attr("width", WIDTH_VIS_3).attr("height", HEIGHT_VIS_3);

const nutrients = ["sugars", "protein", "fiber", "carbo"];
const colorsNutrients = d3.scaleOrdinal()
    .domain(nutrients)
    .range(["#FFA07A", "#98FB98", "#DA70D6", "#8A2BE2"]);

const parseData = d => ({
    name: d.name,
    mfr: d.mfr,
    calories: +d.calories,
    vitamins: +d.vitamins,
    rating: +d.rating,
    sugars: +d.sugars,
    protein: +d.protein,
    fiber: +d.fiber,
    carbo: +d.carbo
});

let allData = [];
let selectedBrandData = [];

d3.csv(CEREAL, parseData).then(data => {
    allData = data;
    crearVis1(data);
    crearVis2(data); // Mostrar todos los nutrientes de todos los cereales al inicio
    crearVis3(data);
});

function crearVis1(data) {
    const colors = {
        "A": "#e37676",
        "G": "#e8c285",
        "K": "#dbf595",
        "N": "#a1cc9f",
        "P": "#7bdbd2",
        "Q": "#7587bf",
        "R": "#ad63ba"
    };

    const manufacturerNames = {
        "A": "American Home Food Products",
        "G": "General Mills",
        "K": "Kellogg's",
        "N": "Nabisco",
        "P": "Post",
        "Q": "Quaker Oats",
        "R": "Ralston Purina"
    };

    data.sort((a, b) => a.name.localeCompare(b.name)); // Ordenar alfabéticamente

    const svg = d3.select("#vis-1 svg");
    const width = svg.attr("width");
    const height = svg.attr("height");
    const radius = Math.min(width, height) / 2 - 130; 

    const arc = d3.arc()
        .innerRadius(radius - 100)
        .outerRadius(d => radius - 100 + d.rating * 2.5) 
        .startAngle((d, i) => (i * 2 * Math.PI) / data.length)
        .endAngle((d, i) => ((i + 1) * 2 * Math.PI) / data.length);

    const arcs = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`)
        .selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("d", arc)
        .attr("fill", d => colors[d.mfr])
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .on("mouseover", (event, d) => {
            const tooltip = d3.select("#tooltip-radial");
            tooltip
                .style("visibility", "visible")
                .html(`Nombre: ${d.name}<br>Calorías: ${d.calories}<br>Vitaminas: ${d.vitamins}`);
            
            tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            
            arcs.attr("fill-opacity", o => o.mfr === d.mfr ? 1 : 0.2);
        })
        .on("mouseout", () => {
            d3.select("#tooltip-radial").style("visibility", "hidden");
            arcs.attr("fill-opacity", 1);
        })
        .on("click", (event, d) => {
            const filteredData = data.filter(c => c.mfr === d.mfr);
            selectedBrandData = filteredData; // Guardar los datos de la marca seleccionada
            crearVis2(filteredData);
            crearVis3(filteredData);
        });

    // Leyenda
    const legend = d3.select("#legend-radial");
    const uniqueMfrs = [...new Set(data.map(d => d.mfr))];

    const legendItems = legend.selectAll("div")
        .data(uniqueMfrs)
        .enter().append("div")
        .attr("class", "legend-item");

    legendItems.append("div")
        .attr("class", "legend-color")
        .style("background-color", mfr => colors[mfr]);

    legendItems.append("span")
        .text(mfr => manufacturerNames[mfr]);
}

function crearVis2(data, nutrientFilter = "all") {
    d3.select("#chart-nutrition").selectAll("*").remove();
    d3.select("#legend-nutrition").selectAll("*").remove();

    const nutrientsToShow = nutrientFilter === "all" ? nutrients : [nutrientFilter];

    const normalizedData = data.map(d => nutrientsToShow.reduce((acc, n) => ({ ...acc, [n]: +d[n] }), { name: d.name }));

    const svg = d3.select("#chart-nutrition");
    const width = svg.attr("width");
    const height = svg.attr("height");

    const numCols = 3; 
    const numRows = Math.ceil(normalizedData.length / numCols);
    const rowHeight = 350; 
    const graphPadding = 10; 
    svg.attr("height", numRows * rowHeight + 100); 

    const maxBarLength = 300; 

    const x0 = d3.scaleBand()
        .domain(nutrientsToShow)
        .range([0, (width / numCols) - graphPadding]) 
        .paddingInner(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(normalizedData, cereal => d3.max(nutrientsToShow, n => cereal[n]))])
        .range([maxBarLength, 0]);

    const groups = normalizedData.map((d, i) => ({
        ...d,
        row: Math.floor(i / numCols),
        col: i % numCols 
    }));

    // Añadir leyenda
    const legend = d3.select("#legend-nutrition");

    const legendItems = legend.selectAll("div")
        .data(nutrientsToShow)
        .enter().append("div")
        .attr("class", "legend-item");

    legendItems.append("div")
        .attr("class", "legend-color")
        .style("background-color", n => colorsNutrients(n));

    legendItems.append("span")
        .text(n => n);

    const groupSelection = svg.selectAll(".graph-group")
        .data(groups)
        .enter().append("g")
        .attr("class", "graph-group")
        .attr("transform", d => `translate(${d.col * ((width / numCols) + graphPadding)}, ${d.row * rowHeight + 40})`);

    groupSelection.append("g")
        .selectAll("rect")
        .data(d => nutrientsToShow.map(n => ({ key: n, value: d[n] })))
        .enter().append("rect")
        .attr("x", d => x0(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x0.bandwidth())
        .attr("height", d => maxBarLength - y(d.value))
        .attr("fill", d => colorsNutrients(d.key));

    groupSelection.append("text")
        .attr("x", (width / numCols - graphPadding) / 2) 
        .attr("y", maxBarLength + 30) 
        .attr("text-anchor", "middle")
        .text(d => d.name);

    groupSelection.append("g")
        .attr("transform", `translate(0, ${maxBarLength})`)
        .call(d3.axisBottom(x0));

    // Ajustar el tamaño del contenedor gris
    d3.select("#vis-2")
        .style("height", `${numRows * rowHeight + legend.node().getBoundingClientRect().height + 1000}px`); 
}

function crearVis3(cereals) {
    const numBins = 10;

    const sugarExtent = d3.extent(cereals, d => d.sugars);
    const ratingExtent = d3.extent(cereals, d => d.rating);

    const sugarBins = d3.histogram()
        .domain(sugarExtent)
        .thresholds(d3.range(sugarExtent[0], sugarExtent[1], (sugarExtent[1] - sugarExtent[0]) / numBins))
        (cereals.map(d => d.sugars));

    const ratingBins = d3.histogram()
        .domain(ratingExtent)
        .thresholds(d3.range(ratingExtent[0], ratingExtent[1], (ratingExtent[1] - ratingExtent[0]) / numBins))
        (cereals.map(d => d.rating));

    const cerealCount = Array.from({ length: numBins }, () =>
        Array.from({ length: numBins }, () => [0, []])
    );

    let maxCount = 0;

    cereals.map(cereal => {
        const sugarIndex = sugarBins.findIndex(bin => bin.x0 <= cereal.sugars && cereal.sugars < bin.x1);
        const ratingIndex = ratingBins.findIndex(bin => bin.x0 <= cereal.rating && cereal.rating < bin.x1);

        if (sugarIndex >= 0 && ratingIndex >= 0) {
            cerealCount[sugarIndex][ratingIndex][0]++;
            cerealCount[sugarIndex][ratingIndex][1].push(cereal.name);

            if (cerealCount[sugarIndex][ratingIndex][0] >= maxCount) {
                maxCount = cerealCount[sugarIndex][ratingIndex][0];
            }
        }
    });

    const svg = d3.select("#chart-heatmap");
    const svgLeyenda = d3.select("#legend-heatmap");

    svg.selectAll("*").remove();
    svgLeyenda.selectAll("*").remove();

    const width = svg.attr("width");
    const height = svg.attr("height");

    const margins3 = { top: 20, right: 30, bottom: 40, left: 40 };

    const x3 = d3.scaleBand()
        .domain(d3.range(numBins))
        .range([margins3.left, width - margins3.right])
        .padding(0.01);

    svg.append("g")
        .attr("transform", `translate(0, ${height - margins3.bottom})`)
        .call(d3.axisBottom(x3).tickFormat((d, i) => {
            const bin = sugarBins[i];
            return `${Math.round(bin.x0)} - ${Math.round(bin.x1)}`;
        }));

    const y3 = d3.scaleBand()
        .domain(d3.range(numBins))
        .range([height - margins3.bottom, margins3.top])
        .padding(0.01);

    svg.append("g")
        .attr("transform", `translate(${margins3.left},0)`)
        .call(d3.axisLeft(y3).tickFormat((d, i) => {
            const bin = ratingBins[i];
            return `${Math.round(bin.x0)} - ${Math.round(bin.x1)}`;
        }));

    svg.append("text")
        .attr("class", "xAxis")
        .attr("text-anchor", "end")
        .attr("x", width -290)
        .attr("y", height - margins3.bottom + 30)
        .text("Gramos de Azúcar por Porción");

    svg.append("text")
        .attr("class", "yAxis")
        .attr("text-anchor", "end")
        .attr("y", -10)
        .attr("x", -40)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Porcentaje de Valoración");

    const colorMap = d3.scaleLinear()
        .domain([0, maxCount])
        .range(["white", "#DA4167"]);

    const colorHover = d3.scaleLinear()
        .domain([0, maxCount])
        .range(["white", "#004b3b"]);

    let tooltip = d3.select("body").append("div")
        .style("opacity", 0)
        .style("width", 200)
        .style("height", 200)
        .style("position", "absolute")
        .style("background", "#96ceb4");

    svg.selectAll("rect")
        .data(cerealCount.flat().map(([count, names], i) => ({
            x: i % numBins,
            y: Math.floor(i / numBins),
            count: count,
            names: names
        })))
        .enter().append("rect")
        .attr("x", d => x3(d.x))
        .attr("y", d => y3(d.y))
        .attr("width", x3.bandwidth())
        .attr("height", y3.bandwidth())
        .style("fill", d => colorMap(d.count))
        .on("mouseover", (event, d) => {
            d3.select(event.currentTarget)
                .style("fill", colorHover(d.count));

            tooltip
                .html(`${d.names}`)
                .style("opacity", 1)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        }).on("mouseout", (event, d) => {
            tooltip.style("opacity", 0);
            d3.select(event.currentTarget)
                .style("fill", colorMap(d.count));
        });

    const legendWidth = 300;
    const legendHeight = 100;

    const leyendaHeat = svgLeyenda.append("svg")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("display", "block");

    leyendaHeat.append("text")
        .attr("x", legendWidth / 2)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Número de cereales");

    const defs = leyendaHeat.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");

    linearGradient.selectAll("stop")
        .data(colorMap.range().map((color, i) => ({
            offset: `${(i * 100) / (colorMap.range().length - 1)}%`,
            color: color
        })))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    leyendaHeat.append("rect")
        .attr("x", 20)
        .attr("y", 20)
        .attr("width", legendWidth - 40)
        .attr("height", 20)
        .style("fill", "url(#linear-gradient)");

    const legendScale = d3.scaleLinear()
        .domain(colorMap.domain())
        .range([20, legendWidth - 20]);

    const axisBottom = d3.axisBottom(legendScale)
        .ticks(5);

    leyendaHeat.append("g")
        .attr("transform", `translate(0, 40)`)
        .call(axisBottom);
}

// Listener para el menú desplegable de nutrientes
d3.select("#nutrient-select").on("change", function() {
    const selectedNutrient = d3.select(this).property("value");
    if (selectedBrandData.length > 0) {
        crearVis2(selectedBrandData, selectedNutrient); // Usar los datos de la marca seleccionada
    } else {
        crearVis2(allData, selectedNutrient); // Usar todos los datos si no se ha seleccionado ninguna marca
    }
});
