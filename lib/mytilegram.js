  var legend = {}; 
  var tooltip = d3.select('body')
      .append('div')
      .classed('tooltip', true)
      .style('opacity', 0)

    var WIDTH = 350
    var HEIGHT = 350

    var svg = d3.select('#tilecontainer')
      .append("div")
        .classed("svg-container", true) //container class to make it responsive
      .append('svg')
        //responsive SVG needs these 2 attributes and no width and height attr
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 400 400")
        //class to make it responsive
        .classed("svg-content-responsive", true); 

    d3.queue()
        .defer(d3.json, 'tiles.topo.json')
        .defer(d3.csv, 'results.csv')
        .await(ready)

    
        
    function ready(error, tilegram, results) {
      

      if (error) throw error

      // convert results to hash for quick lookup
      results = results.reduce(function (a, b) {
        //console.log(b)
        if(legend[b.party]){  
          legend[b.party] =  legend[b.party] + 1;
        }else{
          legend[b.party] = 1 ;
        }
        a[b.geoId] = b.party
        return a
      }, {})

      // legend
      var sortableLegend = [];
      for (var candidate in legend) {
          sortableLegend.push([candidate, legend[candidate]]);
      }

      sortableLegend.sort(function(a, b) {
          return b[1] - a[1];
      });

    
      var cList = $('#legend')
      $.each(sortableLegend, function(i)
      {
          var li = $('<li/>')
              .addClass('ui-menu-item')
              .attr('role', 'menuitem')
              .appendTo(cList);
          var aaa = $('<div/>')
              .addClass('party-'+sortableLegend[i][0].replace(/\s+/g,''))
              .text(sortableLegend[i][0]+ " ("+sortableLegend[i][1]+")")
              .appendTo(li);
      });

     
      //console.log(legend)

      var tiles = topojson.feature(tilegram, tilegram.objects.tiles)

      var transform = d3.geoTransform({
        point: function(x, y) {
          this.stream.point(x, -y)
        },
      })

      var path = d3.geoPath().projection(transform)

      var g = svg.append('g')
        .attr('transform', 'translate(' + -WIDTH / 8 + ',' + HEIGHT + ')scale(0.5)')

      g.selectAll('.tiles')
        .data(tiles.features)
        .enter().append('path')
        .attr('d', path)
        //.attr('class', function(d) { return 'party-' + results[d.id] })
        .attr('class', function(d) { return 'party-' + results[d.id].replace(/\s+/g,'') })
        .on('mouseover', function(d) {
          d3.select(this).attr("class", "mouseoverColor");
          var ev = d3.event
          tooltip.text('Wahlkreis '+ d.id + ' (' + d.properties.name + ') searches for ' + results[d.id] + ' most.')
            .style('opacity', 1)
            .style('left', ev.pageX + 20 + 'px')
            .style('top', ev.pageY + 20 + 'px')
        })
        .on('mouseout', function(d) {
          d3.select(this).attr('class', function(d) { return 'party-' + results[d.id].replace(/\s+/g,'') });
          tooltip.text('').style('opacity',0)
        })
    }
