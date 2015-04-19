(function() {
	var CONFIG = {
		BAR_WIDTH: 6,
		BAR_DISTANCE: 2,
		CLASS_NAME: 'scCharts',
		MAX_HEIGHT: 50,
		FONT_SIZE: 10,
	};
  

  var map = new Datamap({
    scope: 'world',
    element: document.querySelector('#chartsMap'),
  });

  
  map.addPlugin('scCharts', function ( layer, data, options ) {  
    var self = this;


	  var charts = layer
     	.selectAll( CONFIG.CLASS_NAME )
     	.data( data, JSON.stringify );

     	

    charts
	    .enter()
	    .append('rect')
			.attr('class', CONFIG.CLASS_NAME)
			.attr('x', function ( datum ) {
				  return self.latLngToXY(datum.center[1], datum.center[0])[0] - CONFIG.BAR_WIDTH - CONFIG.BAR_DISTANCE / 2;
				})
			.attr('y', function ( datum ) {
				  return self.latLngToXY(datum.center[1], datum.center[0])[1] - datum.value;
				})
			.attr('width', CONFIG.BAR_WIDTH)
			.attr('height', function( datum ) {
					return datum.value;
				});	


    charts
	    .enter()
	    .append('rect')
			.attr('class', CONFIG.CLASS_NAME)
			.attr('x', function ( datum ) {
				  return self.latLngToXY(datum.center[1], datum.center[0])[0] + CONFIG.BAR_DISTANCE / 2;
				})
			.attr('y', function ( datum ) {
				  return self.latLngToXY(datum.center[1], datum.center[0])[1] - datum.value / 2;
				})
			.attr('width', CONFIG.BAR_WIDTH)
			.attr('height', function( datum ) {
					return datum.value / 2;
				});	


		charts
			.enter()
			.append('text')
			.attr('class', CONFIG.CLASS_NAME)
			.attr("x", function( datum ) { 
			  return self.latLngToXY(datum.center[1], datum.center[0])[0];
			})
      .attr("y", function( datum ) { 
			  return self.latLngToXY(datum.center[1], datum.center[0])[1] + CONFIG.BAR_DISTANCE + CONFIG.FONT_SIZE;
      })
      .text( function ( datum ) { 
      	return datum.ISOCode; 
      })
      .attr('font-size', CONFIG.FONT_SIZE)
      .attr('text-anchor', 'middle')
  });

  // map.scCharts(charts, {makeTheBubbleThisColor: 'blue'});

})();
