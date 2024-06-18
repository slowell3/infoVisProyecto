const CEREAL = "cereal.csv";

const WIDTH_VIS_1 = 1000;
const HEIGHT_VIS_1 = 100;
const WIDTH_VIS_2 = 800;
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
    const numRows = Math.ceil(data.length / 5);
    const rowHeight = 350; // Ajusta según necesidades para más espacio
    svg.attr("height", numRows * rowHeight); // Ajusta altura dinámicamente

    const maxBarLength = 300; // Máximo largo de las barras

    const x0 = d3.scaleBand()
        .domain(nutrientsToShow)
        .range([0, width / 5])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, cereal => d3.max(nutrientsToShow, n => cereal[n]))])
        .range([maxBarLength, 0]);

    const groups = data.map((d, i) => ({
        ...d,
        row: Math.floor(i / 5),
        col: i % 5
    }));

    const groupSelection = svg.selectAll("g")
        .data(groups)
        .enter().append("g")
        .attr("transform", d => `translate(${d.col * (width / 5)}, ${d.row * rowHeight})`);

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
        .attr("x", width / 10)
        .attr("y", maxBarLength + 20) // Posicionar el nombre debajo de cada gráfico con un espacio
        .attr("text-anchor", "middle")
        .text(d => d.name);

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

    // Define the number of bins
    const numBins = 10;

    // Create bins for sugars
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

    // Create a 2D array to count cereals in each bin
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
    svg.selectAll("*").remove(); // Limpiar la visualización anterior
    const width = svg.attr("width");
    const height = svg.attr("height");

    // Scale for x axis (sugar)
    const x3 = d3.scaleBand()
        .domain(d3.range(numBins))
        .range([margins3[0], width - margins3[1]])
        .padding(0.01);

    svg.append("g")
        .attr("transform", `translate(0, ${height - margins3[3]})`)
        .call(d3.axisBottom(x3).tickFormat((d, i) => {
            const bin = sugarBins[i];
            return `${Math.round(bin.x0)} - ${Math.round(bin.x1)}`;
        }));

    // Scale for y axis (rating)
    const y3 = d3.scaleBand()
        .domain(d3.range(numBins))
        .range([height - margins3[2], margins3[3]])
        .padding(0.01);

    svg.append("g")
        .attr("transform", `translate(${margins3[0]},0)`)
        .call(d3.axisLeft(y3).tickFormat((d, i) => {
            const bin = ratingBins[i];
            return `${Math.round(bin.x0)} - ${Math.round(bin.x1)}`;
        }));
    
    // Títulos para ejes
    //fuente: https://stackoverflow.com/questions/11189284/d3-axis-labeling
    SVG3.append("text")
        .attr("class", "xAxis")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", 20)
        .text("Gramos de Azúcar por Porción");
    
    //fix if time
    svg.append("text")
        .attr("class", "yAxis")
        .attr("text-anchor", "end")
        .attr("y", 10)
        .attr("x", 180)
        .attr("dy", ".75em")
        //.attr("transform", "rotate(-90)")
        .text("Porcentaje de Valoración");

    // Scale for color
    const colorMap = d3.scaleLinear()
        .domain([0, maxCount]) 
        .range(["white", "#DA4167"]);
        console.log(maxCount)
    
    //Scale for hover color (blue)
    const colorHover = d3.scaleLinear()
        .domain([0, maxCount]) 
        .range(["white", "#004b3b"]);
        console.log(maxCount)

    //tooltip basado en código de https://hernan4444.github.io/iic2026/otros/barchart-with-piechart/
    let tooltip = d3.select("body").append("div")
        .style("opacity", 0)
        .style("width", 200)
        .style("height", 200)
        .style("position", "absolute")
        .style("background", "#96ceb4");

    // Draw rectangles
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
        //tooltip basado en código de https://hernan4444.github.io/iic2026/otros/barchart-with-piechart/
        rect
            .on("mouseover", (event, d) => {
                svg.selectAll("rect")
                    
                d3.select(event.currentTarget)
                    .style("fill", d => colorHover(d.count));

                tooltip
                    .html(` ${d.names}
                        `)//OPCIONAL: azúcar y ratings info <brAzúcar: ${}
                    .style("opacity", 1)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");

            }).on("mouseout", (event, d) => {
                tooltip.style("opacity", 0);
                svg.selectAll("rect")
                    .style("fill", d => colorMap(d.count));
            })
        })
}
