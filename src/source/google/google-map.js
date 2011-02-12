Railo.adapters.Map = function(){
	
	var _maps = {};
	
	var _SUPPORTED_MAP_TYPES ={
		map:'G_NORMAL_MAP',
		satellite:'G_SATELLITE_MAP',
		hybrid:'G_HYBRID_MAP',
		terrain:'G_PHYSICAL_MAP'
		};
	
	function _convertMapType(type){
		
		if(typeof(_SUPPORTED_MAP_TYPES[type] == 'undefined')){
			
		}		
		/*
		 * Eval to load the Google constant. At load time we are not sure constants are 
		 * already in place so we eval the stored string.
		 * No risk cause the evaluated value is not injectable by cf code.
		 */
		return 	eval(_SUPPORTED_MAP_TYPES[type]);
	}
	
	function _createMarker(point,options){
		var markerOptions = {
			draggable: false
		};
		if(options.markercolor.length){
			var icon = new GIcon(G_DEFAULT_ICON);
			icon.image = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%20|" + options.markercolor + "|000000"; 
			icon.shadow = "http://chart.apis.google.com/chart?chst=d_map_pin_shadow"; 
			markerOptions.icon = icon;
		}else if(options.markericon.length){
			var icon = new GIcon(G_DEFAULT_ICON);
			icon.image = options.markericon; 
			markerOptions.icon = icon;			
		}
		var marker = new GMarker(point,markerOptions);
		if(options.markerwindowcontent.length){
			GEvent.addListener(marker, "click", function() { 
    			marker.openInfoWindowHtml(options.markerwindowcontent); 
			})	
  		}
		return marker; 
	}
	
	function _addTypeControl(map,type){
		if(type == 'basic'){
			map.addControl(new GMapTypeControl());
		}else if(type == 'advanced'){
			map.addControl(new GMenuMapTypeControl());
		}
	}

	function _addZoomControl(map,type){
		if(type == 'small'){
			map.addControl(new GSmallMapControl());
		}else if(type == 'large'){
			map.addControl(new GLargeMapControl());
		}else if(type == 'small3d'){
			map.addControl(new GSmallZoomControl3D());
		}else if(type == 'large3d'){
			map.addControl(new GLargeMapControl3D());
		}
	}
			
return {

/**
 * Return the google map object
 * @param {Object} name
 * @return {Object} map
 */
getMapObject : function(name){
	try{
		var m = _maps[name].object;
		if(!m){Railo.globalErrorHandler('map.mapNotFound',[name]);}
	}catch(e){
		alert(e);
	}
	return m;		
},

init : function(name,options){
	
	  options.zoomlevel = parseInt(options.zoomlevel) || 3;
	  options.type = _convertMapType(options.type);
	  	  
	  var map = new GMap2(document.getElementById(name));

	  if(options.typecontrol.length){
	  	_addTypeControl(map,options.typecontrol);	
	  }

	  if(options.zoomcontrol.length){
	  	_addZoomControl(map,options.zoomcontrol);	
	  }
	  
	  if(options.overview == "true"){
	  	map.addControl(new GOverviewMapControl());
	  }
		
	  if(options.showscale == "true"){
	  	map.addControl(new GScaleControl());
	  }	
	
	  if(options.continuouszoom == "true"){
	  	map.enableScrollWheelZoom();
	  }	

	  if(options.doubleclickzoom == "false"){
	  	map.disableDoubleClickZoom();
	  }	

	  if(options.onerror.length){
	  	var f = eval(options.onerror);
		GEvent.addListener(map,'error',function(){
			f();
		});
	  }

	  if(options.onload.length){
	  	var f = eval(options.onload);
		GEvent.addListener(map,'load',function(){
			f(map.getContainer().id,map);
		});
	  }
	  
	  if(options.onnotfound.length) {
	  	options.onnotfound = eval(options.onnotfound);
	  }
	  
	  map.setMapType(options.type);
	  	  

	  _maps[name] = {};	  
	  _maps[name].object = map;
	  _maps[name].options = options;

	  this.setCenter(name,options);			

},

addMarker : function(name, options){
	var map = _maps[name].object;
	if(options.tip){
		options.title = options.tip;		
	}
	if(options.address) {
		var geocoder = new GClientGeocoder();		
		geocoder.getLatLng(options.address, function(point){
			if (!point) {
				var msg = 'Location not found. Address: ' + options.address;
				if(typeof(_maps[name].options.onnotfound) == 'function'){
					_maps[name].options.onnotfound(msg,_maps[name].object.getContainer().id,_maps[name].object);
				}else{
					alert(msg);
				}
			}
			else {
				map.addOverlay( _createMarker(point,options));
			}
		});
	}else {
		var point = new GLatLng(options.latitude, options.longitude);
		if (!point) {
			var msg = 'Location not found. Lat: ' + options.latitude + ' Long: ' + options.longitude;			
			if(typeof(_maps[name].options) == 'function'){
				_maps[name].options.onnotfound(msg,_maps[name].object.getContainer().id,_maps[name].object);
			}else{
				alert(msg);
			}
		}else{
			map.addOverlay(_createMarker(point,options));
		}
	}
},

setCenter : function(name, options){
	var map = _maps[name].object;
	if(options.address){
		var geocoder = new GClientGeocoder();
	  	 geocoder.getLatLng(options.address,function(point){
		 	if(!point){
				var msg = 'Location not found. Address: ' + options.address;
				if(typeof(_maps[name].options.onnotfound) == 'function'){
					_maps[name].options.onnotfound(msg,_maps[name].object.getContainer().id,_maps[name].object);
				}else{
					alert(msg);
				}
			}else{
				map.setCenter(point,options.zoomlevel);
				if(options.showcentermarker) {
					map.addOverlay( _createMarker(point,options));
	 			}
			}
		 });	
	  }else{  
		var point = new GLatLng(options.latitude, options.longitude);		  	
		if (!point) {
			var msg = 'Location not found. Lat: ' + options.latitude + ' Long: ' + options.longitude;			
			if(typeof(_maps[name].options.onnotfound) == 'function'){
				_maps[name].options.onnotfound(msg,_maps[name].object.getContainer().id,_maps[name].object);
			}else{
				alert(msg);	
			}
		}else{
			map.setCenter(point, options.zoomlevel);
			if(options.showcentermarker) {
				map.addOverlay( _createMarker(point,options));
	 		}
		}
	 }
} ,

addEvent : function(map,event,listener){
    m = getMapObject();
    google.maps.event.addListener(m,event,listener);
}

}}

