
//couldn't import tsv as a variable so manually entered here
//thankfully after the data cleaning and wranlging, I was left with a smaller 
//dataset to throw in my script. 

//locally imported d3, and changed it to d3v3 to call d3 version 3.5
var myData = "date	Alaska	American	Delta	JetBlue	Southwest	Spirit	United	Virgin\n\
20170101	584.05	4109.15	4106.68	1955.58	5959.4	351.87	2720.11	320.12\n\
20170201	579.46	2822.17	2139.48	1590.47	3566.65	405.77	1924.41	193\n\
20170301	665.62	4149.15	3048.96	1989.07	5107.38	649.47	2275.15	288.74\n\
20170401	576.58	3960.29	4693.46	1898.59	5428.4	603.28	1876.22	226.9\n\
20170501	547.12	3991.76	4105.97	2257.68	6482.28	694.64	1883.14	371.29\n\
20170601	616.12	5036.71	4108.19	2567.12	7917.66	739.67	2412.09	423.85\n\
20170701	615.2	5501.48	4467.51	2677.43	7834.65	322.78	2503.2	269.94\n\
20170801	601.84	4716.71	3383.88	2437.11	8555.61	441.61	2238.87	322.48\n\
20170901	501.46	3053.86	2435.96	1424.02	4481.91	517.22	1402.94	243.97\n\
20171001	489.67	3533.91	2840.21	1294.05	5113.6	348.4	1613.06	275.69\n\
20171101	482.84	2814.68	1810.87	1114.65	4530.07	330.23	1344.13	256.68\n";

//margins
var margin = {
    top: 25,
    right: 90,
    bottom: 40,
    left: 55
    },
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    //parse date in the data for correct format. 
var parseDate = d3v3.time.format("%Y%m%d").parse;

//scales 
var x = d3v3.time.scale()
    .range([0, width]);

var y = d3v3.scale.linear()
    .range([height, 0]);

var color = d3v3.scale.category10();

var xAxis = d3v3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3v3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3v3.svg.line()
    .interpolate("basis")
    .x(function(d) {
    return x(d.date);
    })
    .y(function(d) {
    return y(d.delay);
    });

var svg = d3v3.select("#delay-d3").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//put data into datta variable to loop through
var data = d3v3.tsv.parse(myData);

color.domain(d3v3.keys(data[0]).filter(function(key) {
    return key !== "date";
}));

//parse through the date and assign pased date into our data values variable
data.forEach(function(d) {
    d.date = parseDate(d.date);
});

//correctly setup the airline infomraiton with a dict. 
var airlines = color.domain().map(function(name) {
    return {
    name: name,
    values: data.map(function(d) {
        return {
        date: d.date,
        delay: +d[name]
        };
    })
    };
});

//domains
x.domain(d3v3.extent(data, function(d) {
    return d.date;
}));


//domains
y.domain([
    d3v3.min(airlines, function(c) {
    return d3v3.min(c.values, function(v) {
        return v.delay;
    });
    }),
    d3v3.max(airlines, function(c) {
    return d3v3.max(c.values, function(v) {
        return v.delay;
    });
    })
]);


//make the legend 
var legend = svg.selectAll('g')
    .data(airlines)
    .enter()
    .append('g')
    .attr('class', 'legend');

legend.append('rect')
    .attr('x', width - 20)
    .attr('y', function(d, i) {
    return i * 20;
    })
    .attr('width', 10)
    .attr('height', 10)
    .style('fill', function(d) {
    return color(d.name);
    });

legend.append('text')
    .attr('x', width - 8)
    .attr('y', function(d, i) {
    return (i * 20) + 9;
    })
    .text(function(d) {
    return d.name;
    });

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Carrier Delays");

//label the airlines    
var airline = svg.selectAll(".airline")
    .data(airlines)
    .enter().append("g")
    .attr("class", "airline");

airline.append("path")
    .attr("class", "line")
    .attr("d", function(d) {
    return line(d.values);
    })
    .style("stroke", function(d) {
    return color(d.name);
    });

airline.append("text")
    .datum(function(d) {
    return {
        name: d.name,
        value: d.values[d.values.length - 1]
    };
    })
    .attr("transform", function(d) {
    return "translate(" + x(d.value.date) + "," + y(d.value.delay) + ")";
    })
    .attr("x", 3)
    .attr("dy", ".30em")
    .text(function(d) {
    return d.name;
    });


//the interactive tool that enables hover and movement across the lines.
var mouseG = svg.append("g")
    .attr("class", "mouse-over-effects");

//line that follows mouse 
mouseG.append("path") 
    .attr("class", "mouse-line")
    .style("stroke", "black")
    .style("stroke-width", "1px")
    .style("opacity", "0");
    
var lines = document.getElementsByClassName('line');

//clearly align each value with each line across mouse movement
var mousePerLine = mouseG.selectAll('.mouse-per-line')
    .data(airlines)
    .enter()
    .append("g")
    .attr("class", "mouse-per-line");

mousePerLine.append("circle")
    .attr("r", 7)
    .style("stroke", function(d) {
    return color(d.name);
    })
    .style("fill", "none")
    .style("stroke-width", "px")
    .style("opacity", "0");

mousePerLine.append("text")
    .attr("transform", "translate(10,3)");

//captures mouse movements
mouseG.append('svg:rect') 
    .attr('width', width) 
    .attr('height', height)
    .attr('fill', 'none')
    .attr('pointer-events', 'all')
    .on('mouseout', function() {
    d3v3.select(".mouse-line")
        .style("opacity", "0");
    d3v3.selectAll(".mouse-per-line circle")
        .style("opacity", "0");
    d3v3.selectAll(".mouse-per-line text")
        .style("opacity", "0");
    })
    .on('mouseover', function() { 
    d3v3.select(".mouse-line")
        .style("opacity", "1");
    d3v3.selectAll(".mouse-per-line circle")
        .style("opacity", "1");
    d3v3.selectAll(".mouse-per-line text")
        .style("opacity", "1");
    })
    .on('mousemove', function() { 
    var mouse = d3v3.mouse(this);
    d3v3.select(".mouse-line")
        .attr("d", function() {
        var d = "M" + mouse[0] + "," + height;
        d += " " + mouse[0] + "," + 0;
        return d;
        });

//get the mouse per line. 
d3v3.selectAll(".mouse-per-line")
    .attr("transform", function(d, i) {
    console.log(width/mouse[0])
    var xDate = x.invert(mouse[0]),
        bisect = d3v3.bisector(function(d) { return d.date; }).right;
        idx = bisect(d.values, xDate);
    
    var beginning = 0,
        end = lines[i].getTotalLength(),
        target = null;

    while (true){
        target = Math.floor((beginning + end) / 2);
        pos = lines[i].getPointAtLength(target);
        if ((target === end || target === beginning) && pos.x !== mouse[0]) {
            break;
        }
        if (pos.x > mouse[0])      end = target;
        else if (pos.x < mouse[0]) beginning = target;
        else break;
    }
    
    d3v3.select(this).select('text')
        .text(y.invert(pos.y).toFixed(2));
        
    return "translate(" + mouse[0] + "," + pos.y +")";
    });
});