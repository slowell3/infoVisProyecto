const CEREAL = "cereal.csv";

const WIDTH_VIS_1 = 1000;
const HEIGHT_VIS_1 = 100;
const WIDTH_VIS_2 = 1000;
const HEIGHT_VIS_2 = 800;
const WIDTH_VIS_3 = 800;
const HEIGHT_VIS_3 = 400;
const margins3 = [30, 30, 30, 30]; // LEFT, RIGHT, TOP, BOTTOM

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

d3.csv(CEREAL, parseData).then(data => {
    crearVis1(data);
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
    const radius = Math.min(width, height) / 2 - 130; // Ajustar el radio para evitar corte

    const arc = d3.arc()
        .innerRadius(radius - 100)
        .outerRadius(d => radius - 100 + d.rating * 2.5) // Ajustar el tamaño de las barras
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
            console.log(filteredData);
            crearVis2(filteredData);
            crearVis3(filteredData);
        });

    // Leyenda
    const legend = d3.select("#legend-radial");
    const uniqueMfrs = [...new Set(data.map(d => d.mfr))];

    legend.selectAll("div")
        .data(uniqueMfrs)
        .enter().append("div")
        .attr("class", "legend-item")
        .each(function (mfr) {
            d3.select(this).append("div")
                .attr("class", "legend-color")
                .style("background-color", colors[mfr]);
            d3.select(this).append("span")
                .text(manufacturerNames[mfr]);
        });
}

function crearVis2(data) {
    // Eliminar el contenido anterior del SVG
    d3.select("#chart-nutrition").selectAll("*").remove();

    // Filtrar los nutrientes a visualizar
    const nutrientsToShow = ["sugars", "protein", "fiber", "carbo"];

    // Normalizar los datos
    data = data.map(d => {
        return nutrientsToShow.reduce((acc, n) => ({ ...acc, [n]: +d[n] }), { name: d.name });
    });

    const svg = d3.select("#chart-nutrition");
    const width = svg.attr("width");
    const height = svg.attr("height");

    // Ajustar el tamaño del SVG basado en el número de filas
    const numCols = 4; // Cambiado a 4 columnas
    const numRows = Math.ceil(data.length / numCols);
    const rowHeight = 350; // Ajusta según necesidades para más espacio
    const graphPadding = 10; // Espacio entre gráficos
    svg.attr("height", numRows * rowHeight); // Ajusta altura dinámicamente

    const maxBarLength = 300; // Máximo largo de las barras

    const x0 = d3.scaleBand()
        .domain(nutrientsToShow)
        .range([0, (width / numCols) - graphPadding]) // Ajustado para 4 columnas
        .paddingInner(0); // Remover el padding entre las barras

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, cereal => d3.max(nutrientsToShow, n => cereal[n]))])
        .range([maxBarLength, 0]);

    const groups = data.map((d, i) => ({
        ...d,
        row: Math.floor(i / numCols), // Ajustado para 4 columnas
        col: i % numCols // Ajustado para 4 columnas
    }));

    const groupSelection = svg.selectAll(".graph-group")
        .data(groups)
        .enter().append("g")
        .attr("class", "graph-group")
        .attr("transform", d => `translate(${d.col * ((width / numCols) + graphPadding)}, ${d.row * rowHeight})`); // Ajustado para 4 columnas y padding entre gráficos

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
        .attr("x", (width / numCols - graphPadding) / 2) // Ajustar posición del texto
        .attr("y", maxBarLength + 30) // Posicionar el nombre debajo de cada gráfico con un espacio
        .attr("text-anchor", "middle")
        .text(d => d.name);

    groupSelection.each(function(d) {
        const g = d3.select(this);
    
        // Eje X
        g.append("g")
            .attr("transform", `translate(0, ${maxBarLength})`)
            .call(d3.axisBottom(x0));
    
            // Eje Y
        //g.append("g")
            //.call(d3.axisLeft(y));
        });

    // Añadir leyenda
    const legend = d3.select("#legend-nutrition")
        .style("transform", `translateY(${numRows * rowHeight + 20}px)`); // Mover la leyenda debajo de todos los gráficos

    legend.selectAll("div")
        .data(nutrientsToShow)
        .enter().append("div")
        .attr("class", "legend-item")
        .each(function (n) {
            d3.select(this).append("div")
                .attr("class", "legend-color")
                .style("background-color", colorsNutrients(n));
            d3.select(this).append("span")
                .text(n);
        });
}




function crearVis3(cereals) {
    console.log(cereals);

    // Define número de cajas (bins)
    const numBins = 10;

    // Crear cajas para azúcar
    const sugarExtent = d3.extent(cereals, d => d.sugars);
    const ratingExtent = d3.extent(cereals, d => d.rating);

    const sugarBins = d3.histogram()
        .domain(sugarExtent)
        .thresholds(d3.range(sugarExtent[0], sugarExtent[1], (sugarExtent[1] - sugarExtent[0]) / numBins))
        (cereals.map(d => d.sugars));
    console.log(sugarBins);

    const ratingBins = d3.histogram()
        .domain(ratingExtent)
        .thresholds(d3.range(ratingExtent[0], ratingExtent[1], (ratingExtent[1] - ratingExtent[0]) / numBins))
        (cereals.map(d => d.rating));

    // Array 2D para contar cereales en cada Bin
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

    console.log(cerealCount);

    const svg = d3.select("#chart-heatmap");
    const svgLeyenda = d3.select("#legend-heatmap");

    //CAMBIAR ESTO A SER EXIT
    svg.selectAll("*").remove(); // Limpiar la visualización anterior
    svgLeyenda.selectAll("*").remove();

    const width = svg.attr("width");
    const height = svg.attr("height");

    const margins3 = { top: 20, right: 30, bottom: 40, left: 40 }; // Márgenes

    // Escala de X (azúcar)
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

    // Escala de y (rating/valoración)
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

    // Títulos para ejes
    // fuente: https://stackoverflow.com/questions/11189284/d3-axis-labeling
    svg.append("text")
        .attr("class", "xAxis")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - margins3.bottom + 30)
        .text("Gramos de Azúcar por Porción");

    svg.append("text")
        .attr("class", "yAxis")
        .attr("text-anchor", "end")
        .attr("y", 10)
        .attr("x", -40)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Porcentaje de Valoración");

    // Escala de color
    const colorMap = d3.scaleLinear()
        .domain([0, maxCount])
        .range(["white", "#DA4167"]);

    // Escala de color de hover (azúl)
    const colorHover = d3.scaleLinear()
        .domain([0, maxCount])
        .range(["white", "#004b3b"]);

    // Tooltip basado en código de https://hernan4444.github.io/iic2026/otros/barchart-with-piechart/
    let tooltip = d3.select("body").append("div")
        .style("opacity", 0)
        .style("width", 200)
        .style("height", 200)
        .style("position", "absolute")
        .style("background", "#96ceb4");

    // Dibuja rectángulos
    svg.selectAll("rect")
        .data(cerealCount.flat().map(([count, names], i) => ({
            x: i % numBins,
            y: Math.floor(i / numBins),
            count: count,
            names: names
        })))
        .join(enter => {
            const rect = enter.append("rect")
                .attr("x", d => x3(d.x))
                .attr("y", d => y3(d.y))
                .attr("width", x3.bandwidth())
                .attr("height", y3.bandwidth())
                .style("fill", d => colorMap(d.count))

            // Tooltip
            rect.on("mouseover", (event, d) => {
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
        });

    // Crear leyenda - código con asistencia de ChatGPT
    const legendWidth = 300;
    const legendHeight = 100;

    const leyendaHeat = svgLeyenda.append("svg")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("display", "block");

    // Título de leyenda
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
        .data(colorMap.range().map((color, i) => {
            return {
                offset: `${(i * 100) / (colorMap.range().length - 1)}%`,
                color: color
            };
        }))
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
