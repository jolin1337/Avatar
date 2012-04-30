/**
 * @author Johannes Lindén / Uniq
 */

if(window){
	//THEME:
	if (window['themes'] === undefined)document.write('<script src="http://dl.dropbox.com/u/8057785/blenderHTML/js/themesSource.js" ></script>');
	
	//TOOLS:
	if (window['Vector'] === undefined){
		document.write('<script src="src2/worker_Classes.js" ></script>');
		document.write('<script src="src2/Static_Prototypes.js" ></script>');
	}
	//Renderer:
	if(window['Rendering'] === undefined|| typeof Rendering != 'object')
		document.write('<script src="src2/renderer.js" ></script>');
}
else if(self.importScripts){	// if webworker form
	importScripts('http://dl.dropbox.com/u/8057785/blenderHTML/js/themesSource.js');			//THEME
	importScripts('src2/worker_Classes.js');		//TOOLS
	importScripts('src2/Static_Prototypes.js');		//Static TOOLS
	innerWidth=600;
	innerHeight=600;
	self.addEventListener('message',function(e){
		if(e.data.indexOf('load')!=-1)
			load(e.data);
	});
}

Math.easeInOut = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};
requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||  
                        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame; 

//Arc - Ball
var Light=function(hex,intent){
	this.color = new color(hex);
	this.position = new Vector( 0, 0, 500 );
	this.intensity = intent || 1;
};
Light.prototype={
	toString:function(){
		return "{"+this.color+","+this.position+"}";
	}
};
var canvas,context;
var scene,camera,renderer;

var nav_frame_renderer, nav_frame_scene;
function load(infoPlayer){

	if(self['window']){
		canvas=document.getElementById('View')||0;
		can = document.getElementById("test");
	}
	else
		canvas = postMessage("");
	context=(canvas?canvas.getContext('2d'):new Canvas());
	cantext=(can?can.getContext('2d'):new Canvas());
	
	if(scene == undefined){
		prop=document.getElementById('props');

		scene = new Scene();
		camera = new Camera();
		renderer = new Rendering();

		nav_frame_scene = new Scene();
		nav_frame_scene.SpaceView3D = null;
		nav_frame_renderer = new Rendering();
		var line = new Object3D();
		var size = 25;
		line.Faces = [
			new Face( new Vertex(size,0,0), new Vertex(0,0,0) ),
			new Face( new Vertex(0,size,0), new Vertex(0,0,0) ),
			new Face( new Vertex(0,0,size), new Vertex(0,0,0) )
		];
		line.fillCol = new color(255,255,255);
		line.id = "random";
		line.position = new Vector();
		line.Faces[0].material = new Material(255,0,0);
		line.Faces[1].material = new Material(0,255,0);
		line.Faces[2].material = new Material(0,0,255);
		nav_frame_scene.addObject(line);

		mouseRay = new Ray();
		mouseRay.shape = "Circle";
		mouseRay.radius = 20;
		mouseRay.point1.position.z = 0;		// not nessesary
		mouseRay.point2.position.z = 500;	// not nessesary

		can.style.position = canvas.style.position = 'absolute';
		can.style.top = canvas.style.top=0;
		can.style.left = canvas.style.left=0;

		cantext.shadowBlur = context.shadowBlur = 1;
		can.style.background = canvas.style.background = "rgba(0,0,0,0)";

		init();
		you = infoPlayer.id;
		for(var i in infoPlayer.players){
			var obj;
			if( infoPlayer.players[i].id != you )
				obj = new Cube(infoPlayer.players[i].position.x,infoPlayer.players[i].position.y,infoPlayer.players[i].position.z, 40, new color(255,255,0));
			else
				obj = new Cube(infoPlayer.players[i].position.x,infoPlayer.players[i].position.y,infoPlayer.players[i].position.z, 40, new color(255,0,0));
			obj.id = infoPlayer.players[i].id;
			obj.positionTo = new Vector;
			scene.addObject(obj);
		}
		document.body.style.background=ThemeView3D.windowBackground;// default = "#393939";
		
	}
	can.width = canvas.width=innerWidth;
	can.height = canvas.height=innerHeight;

	prop=document.getElementById('props');
	width = canvas.width -( prop&&prop.style.display == "block"?prop.offsetWidth:0 );
	context.translate(canvas.width/2 -( prop&&prop.style.display == "block"?prop.offsetWidth/2:0 ),canvas.height/2);
	cantext.translate(can.width/2 -( prop&&prop.style.display == "block"?prop.offsetWidth/2:0 ),can.height/2);
	camera.quaternion = current_quaternion;
	var temp = context;
	context = document.getElementById('navigaor').getContext("2d");
	context.translate(25,25);
	context = temp;

	requestAnimationFrame(render);
	return canvas;
};

/**
 * start och slut på musklick i sfären
 */
var rot_start, rot_end;
var zo_start, zo_end, zoom = 1, zoomFactor = 0.02;

/**
 *	Miljöns berd och höjd (100%, 100%)
 */
var width=innerWidth, height=innerHeight;

/**
 * en ray som anger ett område från kameran till en punkt
 */
var mouseRay;

/**
 * fasta lägen för kameran 
 */
var goal_quaternions = [
	new Quaternion(1,new Vector(0,0,0)),						// 7 btn
	new Quaternion(0.707,new Vector(0.707,0,0)),				// 3 btn
	new Quaternion(0.5,new Vector(0.5,0.5,-0.5)),				// 1 btn
	
	new Quaternion(-90,new Vector(-45,45/2,-45)),				//start pose	
];
if(window) {
	/*
	 * the property-pane element
	 */
	var prop;
}

/**
 * hur skall första vyn se ut?
 */
var current_quaternion = goal_quaternions[3];

/**
 * beskriver förändringen i vyn under onMouseDrag(mouse) funktionen
 */
var delta_quaternion = goal_quaternions[0];

/**
 * hanterar vilken typ av ändring som skall göras i miljön med musen
 */
var ROTATION_FLAG = false, ZOOM_FLAG = false, GRAB_FLAG = false;

/**
 * om HAS_DRAGED == true så har vi börjat att rotera
 * annars HAS_DRAGED == false (default) vi kan göra andra operationer
 */
var HAS_DRAGED = false;

var you;

/*=========================== ACTIONS =======================================================================*/
/**
 * anropas som en init när man skall börja förändra något i miljön med musen
 */
function mousePressed(mouse) {
    if((mouse.button==0)&&!mouse.ctrlKey||(mouse['touches']&&mouse.touches.length>=1)){
		ROTATION_FLAG = true;
	}
	else if(mouse.button==0&&mouse.ctrlKey){
		ZOOM_FLAG=true;
	}
	HAS_DRAGED=false;
	return false;
}

/**
 * anropas så fort musen rör sig, synkroniserad
 */
function mouseDragged(mouse){
	if (ROTATION_FLAG){
		HAS_DRAGED=true;
		rot_start = rot_end;
	}
	else if(GRAB_FLAG){
		var inv = camera.quaternion.inverse();
		if( rot_start.x === -1.1 ){
			for( var i in active_vertices )
				active_vertices[i].realPosition = active_vertices[i].position;
			rot_start = new Vector( mouse.clientX, mouse.clientY, 0 );
		}
		else{
			rot_end = new Vector( mouse.clientX, mouse.clientY, 0 );
			//console.dir(rot_start.data(), rot_end.data());
			var f = new Vector(0,0,500);
			var s = Vector.sub( rot_start, rot_end );
			var k = s.y/s.x ;
			var vec = inv.actOn(s).normalize().mult(k);

			for( var i in active_vertices ){
				active_vertices[i].position = Vector.sub(active_vertices[i].realPosition, vec);
			}
			//rot_start = rot_end;
		}
	}
}

function mouseReleased(mouse){
	ROTATION_FLAG&&(ROTATION_FLAG=false);
	ZOOM_FLAG&&(ZOOM_FLAG=false);
	rot_start=rot_end;
	if( !GRAB_FLAG && !HAS_DRAGED && mouse.button == 2 && view3D.MODE == "editmode" ) {
		var v = new Vector(mouse.clientX - canvas.width/2 -( prop&&prop.style.display == "block"?prop.offsetWidth/2:0 ),mouse.clientY - canvas.height/2,500);
		//scene.objects[0].Faces[0].vertices[0].position = v;
		if((v=selection(v))) {
			try{
				v = v[0].split(',');
			}catch(e){
				try{
					v = v.split(',');
				}catch(e){
					return;
				}
			}
			if(!mouse.ctrlKey)
				disableObjects();
			try{
				scene.objects[v[0]].Faces[v[1]].vertices[v[2]].activeVertex = !scene.objects[v[0]].Faces[v[1]].vertices[v[2]].activeVertex;
			}catch(e){
				if(v.length > 2)
					scene.objects[v[0]].Faces[v[1]].handles[v[2]].activeSpline = !scene.objects[v[0]].Faces[v[1]].handles[v[2]].activeSpline;
				else
					scene.objects[v[0]].Faces[v[1]].activeSpline = !scene.objects[v[0]].Faces[v[1]].activeSpline;
			}
		}
	}
	else if(GRAB_FLAG){
		GRAB_FLAG = false;
	}
} 

function keyDown(key){
	if(!ROTATION_FLAG){
		var type = "easeInOut";//{duration:300};
		var wa = false;
		switch(key.keyCode){
			case 37: 		// right
				if( scene.getObject(you).positionTo.x > -140 )
					wa = true,
					scene.getObject(you).positionTo.x -= 40;
			break;
			case 38: 		// down
				if( scene.getObject(you).positionTo.y > -140 )
					wa = true,
					scene.getObject(you).positionTo.y -= 40;
			break;
			case 39: 		// left
				if( scene.getObject(you).positionTo.x < 140 ) 
					wa = true,
					scene.getObject(you).positionTo.x += 40;
			break;
			case 40: 		// up
				if( scene.getObject(you).positionTo.y < 140 )
					wa = true,
					scene.getObject(you).positionTo.y += 40;
			break;
			default:
				//console.log(key.keyCode);
				document.getElementById('chatt').getElementsByTagName('input')[0].focus();
				break;
		}
		if(wa){
			socket.emit('request-position-change', you, {
				'x': scene.getObject(you).positionTo.x,
				'y': scene.getObject(you).positionTo.y,
				'z': scene.getObject(you).positionTo.z
			});
			/*
			$(scene.getObject(you).position).stop();
			$(scene.getObject(you).position).animate({
				"x": scene.getObject(you).positionTo.x,
				"y": scene.getObject(you).positionTo.y,
			}, type);*/
		}
	}
}
function init(){
	var objt  = [];
	var col= new color(100,100,100);
	var col2= new color(0,0,0);
	var yello = new color(255,255,1);

	/*objt[0] = new Cube(0,0,20,40, new color(255,1,1), new color(255));
	objt[0].id = you;
	objt[0].positionTo = new Vector;*
	/*try{
		for( var i in objt[0].Faces ){
			objt[0].Faces[i].material = new Material(255,255,255);
			objt[0].Faces[i].material = new Material(parseInt(Math.random()*255),parseInt(Math.random()*255),parseInt(Math.random()*255));
			objt[0].Faces[i].material.image= new Image();
			objt[0].Faces[i].material.image.src="./images/littlebotbunny_art.jpg";
			objt[0].Faces[i].material.image.onload=function(){
				console.log(this.complete);
			}
		}
	}catch(e){
		
	}*/

	scene.addObject(new Plane(0,0,0,360,new color(100,200,100)));
	var l=new Light(255,1);
	scene.addLight(l);
}
function render(){  
	if(context){
		var temp = context;
		context = document.getElementById('navigaor').getContext("2d");
		context.clearRect(-25,-25,50,50);
		nav_frame_renderer.render(nav_frame_scene,camera,{mode: view3D["MODE"]});
		context = temp;
		context.clearRect(
			-innerWidth/2 +( prop&&prop.style.display == "block"?prop.offsetWidth/2:0 ),
			-innerHeight/2,
			innerWidth,
			innerHeight);
		requestAnimationFrame(render);
		return renderer.render(scene,camera,{mode: view3D["MODE"]});
	}
	return true;
}

function disableObjects(){
	
	var all=(scene?scene.objects:arguments[1].objects),o=all.length;

	for(var i=0;i<o;i++) {
		var object = all[i];
		var ans = [];
		var f=object.Faces.length;

		for(var j=0;j<f;j++){
			var face = object.Faces[j];

			if ( face instanceof Face ) {
				face.activeFace=false;
				var v = face.vertices.length;

				for(var k=0;k<v;k++)
					face.vertices[k].activeVertex=false;
			}

			if ( face instanceof VertexC ) {
				var v = face.handles.length;
				face.activeSpline=false;

				for(var k=0;k<v;k++)
					face.handles[k].activeSpline=false;
			}
		}
	}
}

function selection(loc){
	if(context){
		loc.z = 500;
		mouseRay.point1.position = loc.clone();
		loc.z = 0;
		mouseRay.point2.position = loc.clone();
		var res = renderer.selectRay(mouseRay, {single:false,scene:scene, camera:camera});
		if(!res)return false;
		var I=res.length;
		for( var i= 0;i<I;i++ )
			for(var j=i+1; j<I;j++)
				if(res[i] == res[j])
					res.splice(j,1);
		return res;
	}
	return false;
}

/**
 * Beräkning av x och y muspositioner
 */ 
function computeSphereVector(x, y){
	var g = width/5.0;           //radien av sfären/globen

	var pX = (x-width/2.0)/g;    
	var pY = (y-height/2.0)/g;
	var L2 = pX*pX + pY*pY;
	var pZ = Math.sqrt(1); 
	return new Vector(pX, pY, pZ);
} 
