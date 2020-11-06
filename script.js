Promise.all([ // load multiple files
        d3.json('airports.json'),
        d3.json('world-110m.json')
    ]).then(data=>{ // or use destructuring :([airports, wordmap])=>{ ... 
        let airports = data[0]; // data1.csv
        let worldmap = data[1]; // data2.json

let margin = { top: 40, right: 20, bottom: 40, left: 100 },
    width = 750 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
    


let svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
const features = topojson.feature(worldmap, worldmap.objects.countries).features;
const projection = d3.geoMercator()
    .fitExtent([[0,0], [width,height]], topojson.feature(worldmap, worldmap.objects.countries));

const path = d3.geoPath()
    .projection(projection);

svg.selectAll("path")
    .data(features)
    .join("path")
    .attr("d", path)
    .attr("fill", "dimgray");
    

svg.append("path")
	.datum(topojson.mesh(worldmap, worldmap.objects.countries))
	.attr("d", path)
	.attr('fill', 'none')
    .attr('stroke', 'white')
	.attr("class", "subunit-boundary");
    

var pList = []
      for (i = 0; i < airports.nodes.length; i++) {
        pList.push(airports.nodes[i].passengers);
      }

console.log("passengers", pList)

let circleScale = d3
  .scaleLinear()
  .domain(d3.extent(pList))
  .range([4,9])
  

let force = d3.forceSimulation(airports.nodes)
    .force("charge", d3.forceManyBody().strength(-25))
    .force("link", d3.forceLink(airports.links).distance(50))
    .force("center",d3.forceCenter()
        .x(width / 2)
        .y(height / 2)
    )

    visType = "force";
      switchLayout()

    function switchLayout() {

      if (visType === "map") {

        //transition force nodes
        linksForce = svg.selectAll('.chart')
            .data(airports.links)
            .enter()
            .append('line')
            .attr('class', 'force')
            .attr('x1', (d)=> (d.source.x))
            .attr('y1',(d) => (d.source.y))
            .attr('x2', (d) => (d.target.x))
            .attr('y2',(d) => (d.target.y))
            .transition()
            .duration(1000)
            .attr("x1", function(d) {
                return projection([d.source.longitude, d.source.latitude])[0];
        })
            .attr("y1", function(d) {
                return projection([d.source.longitude, d.source.latitude])[1];
        })
            .attr("x2", function(d) {
                return projection([d.target.longitude, d.target.latitude])[0];
        })
            .attr("y2", function(d) {
                return projection([d.target.longitude, d.target.latitude])[1];
        })
            .attr('stroke', 'black')
            .attr('stroke', 'black')

        let linksMap = svg.selectAll('.chart')
            .data(airports.links)
            .enter()
            .append('line')
            .attr('class', 'map')
            .attr('x1', (d)=> (d.source.x))
            .attr('y1',(d) => (d.source.y))
            .attr('x2', (d) => (d.target.x))
            .attr('y2',(d) => (d.target.y))
            .transition()
            .duration(1000)
            .attr("x1", function(d) {
                return projection([d.source.longitude, d.source.latitude])[0];
        })
            .attr("y1", function(d) {
                return projection([d.source.longitude, d.source.latitude])[1];
        })
            .attr("x2", function(d) {
                return projection([d.target.longitude, d.target.latitude])[0];
        })
            .attr("y2", function(d) {
                return projection([d.target.longitude, d.target.latitude])[1];
        })
            .attr('stroke', 'black')


        let nodesMap = svg.selectAll('.chart')
            .data(airports.nodes)
            .enter()
            .append('circle')
            .attr('class', 'map')
            .attr('cx', (d,i)=>(d.x))
            .attr('cy', (d,i)=>(d.y))
            .attr('fill', 'orange') 
            .attr('r',d=>circleScale(d.passengers))
            .on("mouseenter", (event, d) => {
              const position = d3.pointer(event, window)
              d3.selectAll('.tooltip')
                  .style('display','inline-block')
                  .style('position','fixed')
                  .style('top', position[1]+'px')
                  .style('left', position[0]+'px')
                  .html(
                      d.name 
                  )
          })
          .on("mouseleave", (event, d) => {
              d3.selectAll('.tooltip')
                  .style('display','none')
              //console.log("HERE")
          })
            .transition()
            .duration(1000)
            .attr("cx", function(d) {
                return projection([d.longitude, d.latitude])[0];
        })
            .attr("cy", function(d) {
                return projection([d.longitude, d.latitude])[1];
        })

        svg.selectAll("path")
              .attr("opacity", 0);


        svg.selectAll('.force').remove()

        force.alpha(0.5).stop();
        
        force.on("tick", () => {
          linksMap
          .attr("x1", function(d) {
            return projection([d.source.longitude, d.source.latitude])[0];
          })
          .attr("y1", function(d) {
            return projection([d.source.longitude, d.source.latitude])[1];
          })
          .attr("x2", function(d) {
            return projection([d.target.longitude, d.target.latitude])[0];
          })
          .attr("y2", function(d) {
            return projection([d.target.longitude, d.target.latitude])[1];
          });
        
          nodesMap
          .attr("transform", function(d){
            return "translate(" + projection([d.longitude, d.latitude]) + ")";
          })

          drag.filter(event => visType === "force")
        
        });

        
        
        svg.selectAll('path')
        .transition()
              .delay(500)
        .attr('opacity', 1)

      } else { // force layout

        svg.selectAll('.map').remove()

        drag = force => {

          function dragstarted(event) {
            if (!event.active) force.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
          }
          
          function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          }
          
          function dragended(event) {
            if (!event.active) force.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
          }
          
          return d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended);
        }
        force.alpha(0.5).restart();
        // set the map opacity to 0

    let linksForce = svg.selectAll('.chart')
        .data(airports.links)
        .enter()
        .append('line')
        .attr('class', 'force')
        .attr('x1', (d)=> (d.source.x))
        .attr('y1',(d) => (d.source.y))
        .attr('x2', (d) => (d.target.x))
        .attr('y2',(d) => (d.target.y))
        .attr('stroke', 'black')

      let nodesForce = svg.selectAll('.chart')
        .data(airports.nodes)
        .enter()
        .append('circle')
        .attr('class', 'force')
        .attr('cx', (d,i)=>(d.x))
        .attr('cy', (d,i)=>(d.y))
        .attr('fill', 'orange') 
        .attr('r',d=>circleScale(d.passengers))
        .call(drag(force));
        svg.selectAll("path")
              .attr("opacity", 0);

        force.on("tick", () => {
        linksForce
            .attr("x1", d => (d.source.x))
            .attr("y1", d => (d.source.y))
            .attr("x2", d => (d.target.x))
            .attr("y2", d => (d.target.y));
      
        nodesForce
            .attr("cx", d => (d.x))
            .attr("cy", d => (d.y))
      
      });
      }
      
    }

    d3.selectAll("input[name=display]").on("change", event=>{
      visType = event.target.value;// selected button
      switchLayout();
    });
    


  })