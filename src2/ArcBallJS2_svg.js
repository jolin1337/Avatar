/**
 * @author Johannes Lindén / http://solidcloud.se/
 */

if(self['window']){
	//THEME:
	if (window['themes'] === undefined)document.write('<script src="../../js/themesSource.js" ></script>');
	//TOOLS:
	if (window['Vector'] === undefined){
		document.write('<script src="src2/worker_Classes.js" ></script>');
		document.write('<script src="src2/Static_Prototypes.js" ></script>');
	}
}
else if(self.importScripts){
	importScripts('../js/themesSource.js');			//THEME
	importScripts('../src2/worker_Classes.js');		//TOOLS
	importScripts('../src2/Static_Prototypes.js');		//Static TOOLS
	innerWidth=600;
	innerHeight=600;
	self.addEventListener('message',function(e){
		if(e.data.indexOf('load')!=-1)
			load(e.data);
	});
}
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
var Quaternion=function(v,q,u,z){
	if(arguments.length==2){
		this.x=v;
		this.u=q||new Vector(0,0,0);
	}
	else{
		this.x=v||0;
		this.u=new Vector(q||0,u||0,z||0);
	}
	this.mult=function(q){
		var z=this.x*q.x - this.u.dot(q.u);
		var w = this.u.cross(q.u);
		w.add(Vector.mult(q.u,this.x));
		w.add(Vector.mult(this.u,q.x));
		return new Quaternion(z,w);
	};
	this.scalarMult=function(s){
		return new Quaternion(this.x*s,new Vector(this.u.x*s,this.u.y*s,this.u.z*s));
	};
	this.angle=function(){
		return 2.0*Math.acos(this.x);
	};
	this.power=function(p){
		var theta2=acos(this.x);
		theta2*=p;
		var U = new Vector(this.u.x,this.u.y,this.u.z);
		U.normalize();
		U.mult(Math.sin(theta2));
		return new Quaternion(Math.cos(theta2),U);
	};
	this.copy=function(){
		return new Quaternion(this.x,this.u.x,this.u.y,this.u.z);
	};
	this.inverse=function(){
		var L2= this.x*this.x + this.u.dot(this.u);
		var y = this.x/L2;
		var w = new Vector(-this.u.x/L2,-this.u.y/L2,-this.u.z/L2);
		return new Quaternion(y,w);
	};
	this.conj=function(q){
		return q.mult(this).mult(q.inverse());
	};
	this.actOn=function(v){
		var V= new Quaternion(0.0,v);
		var R = V.conj(this);
		return R.u;
	};
	this.rotateScene=function(){
		var rot_angle = 2.0*Math.acos(this.x);
		
		var rot_axis = new Vector(this.u.x,this.u.y,this.u.z);
		rot_axis.normalize();
		
		this.rotate(rot_angle,rot_axis.x,rot_axis.y,rot_axis.z);
	};
	this.normalize=function(){
		var b= 1 / Math.sqrt(this.x*this.x + this.u.x*this.u.x + this.u.y*this.u.y + this.u.z*this.u.z );
		return new Quaternion(this.x*b , this.u.x*b, this.u.y*b, this.u.z*b );
	};
	this.length=function(){
		return Math.sqrt(this.u.dot(this.u) + this.x*this.x);
	};
}
var Scene=function(){
	this.objects=[];
	this.lights=[];
	this.selected=0;
	this.show={
		grid:true,
		xAxis:true,
		yAxis:true,
		zAxis:false,
		render:false,
		cursor:true
	};
	this.addObject=function(a){
		this.objects.push(a);
	};
	this.removeObject=function(b){
		return this.objects.splice(b,1);
	};
	this.addLight=function(a){
		this.lights.push(a);
	};
	this.removeLight=function(b){
		return this.lights.splice(b,1);
	};
	this.select=function(b){
		this.selected=b;
		this.objects[b].seleced=true;
	};
	this.deselect=function(b){
		this.objects[b].selected=false;
	};
	this.getSelected=function(){
		return this.objects[this.selected];
	};
};
var Camera=function(pos,rot){
	this.position	= new Vector(0,0,500);
	this.rotation	= new Vector(0,0,0);
	this.scale		= new Vector(1,1,1);
	this.lens		= 45;
	this.width		= "auto";
	this.height		= "auto";
	this.quaternion	= new Quaternion(-90,new Vector(-45,45/2,-45))
};
var Rendering=function(){
	var objects={};
	this.projection=function(s,c){
		var f=new Vector(0,0,c.lens*10),v=new Vector(1,1,1);
		function joinMethod(t){
			return (t.splice(t.length-1,1)).join("-false");
		}
		function project (d,e){
			//referenser
			//http://en.wikipedia.org/wiki/3D_projection
			//http://www.devmaster.net/articles/software-rendering/part1.php
			var x, y, z;
			/*
			x=f.x+(v.x-f.x)*f.z/(f.z-v.z);
			y=f.y+(v.y-f.y)*f.z/(f.z-v.z);*/
			x=(d.x-e.x)*e.z/(e.z-d.z);
			y=(d.y-e.y)*e.z/(e.z-d.z);
			z=Math.sqrt(d.dot(e));
			return new Vector( x, y, z ); 
		}
		function projectPolygons(P, f,s,l,obj){
			if(P instanceof Array){
				var ans = [],light=[],color=[],f=f
					,rec=[];
				for (var i=0; i<P.length; i++){
					ans[i] = new Face(); 
					if(P[i] instanceof Array){
						for (var j=0; j<P[i].length; j++ ){
							ans[i][j] = project(P[i][j],f);   
							ans[i][j].mult(s);
						}  
					}
					else if(P[i] instanceof Face){
						l[0].position.normalize();
						if(P[i].normal){
							ans[i].light=P[i].normal.dot(l[0].position)*l[0].intensity;
							console.clear();console.log(P[i].normal.dot(l[0].position));
							ans[i].color=P[i].color.clone().multiply(ans[i].light).toStyle();//object.fillCol.clone().multiply(projekt[i][k].light).toStyle()
						}
						for (var j=0; j<P[i].vertices.length; j++){
							ans[i].vertices.push(new Vertex(P[i].vertices[j].position));
							if(!this.Pmode)
								ans[i].vertices[j].screen = P[i].vertices[j].worldPosition;//projectOth(P[i].vertices[j].worldPosition,f);   
							ans[i].vertices[j].screen.mult(s);
						}  
					}
				}
				var path=[],index=0;
				ans.sort(function(a,b){
					var a1=0,b1=0,r=0;
					for(var i=0;i<a.vertices.length;i++){
						a1+=a.vertices[i].screen.dot(f);
					}
					for(var i=0;i<b.vertices.length;i++){
						b1+=b.vertices[i].screen.dot(f);
					}
					r=a1-b1;
					path[index]=r;
					index++;
					return r;
				});
				index=0;
				var t="";
				if(obj.indexOf('-false')!=-1){
					var t=obj.split('-false');
					if(t.length>2)
						joinMethod(t);
					t=t[0];
				}
				else
					t=obj;
				/*objects[t].getElementsByTagName('polygon').sort(function(a,b){
					index++;
					return path[index-1];
				});*/
				return [ans,rec,light];
			}
			else if(P instanceof Face){
				alert(P);
			}
		}
		
		var all=s.objects,o=all.length;
		var projekt=[];
		var color=[];
		var newO=[];
		for(var i=0;i<o;i++){			//loop objects
			var object=all[i],vert=[];
			newO[i] = (objects[object.id]===undefined)?object.id:object.id+"-false";
			if(newO[i].indexOf('-false')==-1){
				objects[newO[i]]=document.createElementNS('http://www.w3.org/2000/svg','g');
				objects[newO[i]].faces=[];
				objects[newO[i]].setAttribute('class',newO[i]);
				document.getElementById('View3D').appendChild(objects[newO[i]]);
			 }//sheet's
			for(var j=0;j<object.Faces.length;j++){
				vert[j]=new Face();
				vert[j].color=object.fillCol;
				for(var k=object.Faces[j].vertices.length,k2=0;k2<k;k2++){
					vert[j].vertices[k2]=new Vertex(object.Faces[j].vertices[k2].position.clone());
					vert[j].vertices[k2].worldPosition=c.quaternion.actOn(vert[j].vertices[k2].position.add(object.position));
				}
				if(object.Faces[j].vertices.length>=3)
					vert[j].normal=vert[j].calculateNormal();
			}
			var b=projectPolygons(vert,f,c.scale,s.lights,newO[i]);
			projekt.push(b[0]);
			color.push({i:b[1],color:object.fillCol});
			if(svg){
				for(var k=0;k<object.Faces.length;k++){
					if(newO[i].indexOf('-false')==-1){
						var f4="";
						for(var l=projekt[i][k].vertices.length,l2=0;l2<l;l2++)
							f4+=projekt[i][k].vertices[l2].screen.x+","+projekt[i][k].vertices[l2].screen.y+" ";
						f4=f4.split(' ');//console.log(projekt[i][k].vertices);
						f4.splice(f4.length-1,1);
						f4=f4.join(' ');
						var f=document.createElementNS('http://www.w3.org/2000/svg','polygon');
						f.setAttribute('points',f4);
						f.setAttribute('class',k);
						if(frame){
							f.setAttribute('marker-mid','url(#vertex)');
							f.setAttribute('marker-end','url(#vertex)');
						}
						else{
							f.setAttribute('marker-mid','none');
							f.setAttribute('marker-end','none');
						}
						f.setAttribute('onclick','alert("'+newO[i]+':'+k+'");');
						f.setAttribute('style','stroke:'+(frame?themes.view3D.wire:"transparent")+';fill:rgba('+parseInt(Math.random()*255)+','+parseInt(Math.random()*255)+','+parseInt(Math.random()*255)+',1);');//+object.fillCol.clone().multiply(projekt[i][k].light).toStyle()+';');
						objects[newO[i]].faces.push(f4);
						objects[newO[i]].appendChild(f);
						var a=document.getElementById("styleObjects");
					}
					else{
						var t=newO[i].split('-false');
						if(t.length>2)
							joinMethod(t);
						t=t[0];
						var f4="";
						for(var l=projekt[i][k].vertices.length,l2=0;l2<l;l2++)
							f4+=projekt[i][k].vertices[l2].screen.x+","+projekt[i][k].vertices[l2].screen.y+" ";
						f4=f4.split(' ');
						f4.splice(f4.length-1,1);
						f4=f4.join(' ');
						var f=objects[t].getElementsByTagName('polygon')[k];
						if(frame){
							f.setAttribute('marker-mid','url(#vertex)');
							f.setAttribute('marker-end','url(#vertex)');
						}
						else{
							f.setAttribute('marker-mid','none');
							f.setAttribute('marker-end','none');
						}
						//f.setAttribute('style','stroke:'+(frame?themes.view3D.wire:"transparent")+';fill:'+object.fillCol.clone().multiply(projekt[i][k].light).toStyle()+';');
						objects[t].faces[k]=f4;
						f.setAttribute('points',f4);
					}
				}
			}
			for(var j=0;j<=i;j++){		//loop 
				if(projekt[i][0].vertices[0].screen.z<projekt[j][0].vertices[0].screen.z){
						//THE PROJEKT ARRAY
					var C=projekt[i];
					projekt[i] = projekt[j];
					projekt[j]=C;
					projekt[i]=projekt[i];
						//THE SVG ELEMENTS
					if(svg){
						var t=newO[i].split('-false');
						if(t.length>2)
							joinMethod(t);
						t=t[0];
						objects[t].parentNode.insertBefore(
							objects[t],
							objects[t].parentNode.getElementsByTagName('g')[j]
						);
					}
						//THE COLOR
					var d=color[i];
					color[i] = color[j];
					color[j] = d;
					color[i] = color[i];
					color[i].z=all[i].center.dot(f);
					color[j].z=all[j].center.dot(f);
				}
			}
		}
		return [projekt,color];
	};
	
	this.render=function(scene,camera){
		function paintPolygons(P,A,L){
		}
		var proj=this.projection(scene,camera);
		if(!svg){
			for(var b=proj[0].length,i=0;i<b;i++){
				var p=proj[1][i].color;
				context&&(context.strokeStyle=themes.view3D.wire);
				var P=proj[0][i],
					L=scene.lights[0];
				if (context){
					for (var k=0;k<P.length;k++){
						context&&(context.fillStyle=P[k].color);
						context.beginPath();
						context.moveTo(P[k].vertices[0].screen.x, P[k].vertices[0].screen.y);
						for(var j=0;j<P[k].vertices.length;j++){
							context.lineTo(P[k].vertices[j].screen.x, P[k].vertices[j].screen.y);
						}
						context.closePath();
						context.fill();
						if(frame)
							context.stroke();  
						var w=themes.view3D.vertexSize;
						context.save();
						context.fillStyle=themes.view3D.vertex;
						if(frame)
							for(var j=0;j<P[k].length;j++){
								context.fillRect(
											P[k][j].x-w/2, P[k][j].y-w/2,
											w  , w   );
							}
						context.restore();
					}
				}
			}
		}
	};
};
var canvas,context;
function load(e){
	if(self['window'])
		canvas=document.getElementById('View')||0;
	else
		canvas = postMessage("");
	canvas.position='absolute';
	canvas.style.top=0;
	canvas.style.left=0;
	canvas.width=innerWidth;
	canvas.height=innerHeight;
	context=(canvas?canvas.getContext('2d'):new Canvas());
	canvas.style.background=themes.view3D.windowBackground;// default = "#393939";
	context.translate(canvas.width/2,canvas.height/2);
	context.shadowBlur = 1;
	mousePressed({pageX:0,pageY:0,button:1});
	mouseDragged({pageX:0,pageY:0});
	mouseReleased();
	render();
	return canvas;
};

/**
 * start och slut på musklick i en globen
 */
var rot_start, rot_end;
var zo_start, zo_end, zoom = 1, zoomFactor = 0.02;

/**
	Miljöns berd och höjd (100%, 100%)
*/
var width=innerWidth,height=innerHeight;

/**
 * fasta lägen för kameran 
 */
var goal_quaternions = [
	new Quaternion(90,new Vector(90,0,90)),				//y-up and z forward
	new Quaternion(90,new Vector(90,0,0)),				//z-up and y forward
	new Quaternion(90,new Vector(90,90,-90)),				//z-up and x forward
	
	new Quaternion(-90,new Vector(-45,45/2,-45))				//start pose	
];

var current_quaternion = goal_quaternions[3];

var delta_quaternion = goal_quaternions[3];


var ROTATION_FLAG = false, ZOOM_FLAG = false;

var scene = new Scene();
var camera = new Camera();
var renderer = new Rendering();
/*=========================== ACTIONS =======================================================================*/

function mousePressed(mouse) {
    if((mouse.button==typeInter&&!mouse.ctrlKey||(mouse['touches']&&mouse.touches.length>=1))){
		ROTATION_FLAG = true;
		if(mouse['touches'])
			rot_start = computeSphereVector(mouse['touches'][0].pageX, mouse['touches'][0].pageY);
		else
			rot_start = computeSphereVector(mouse.pageX, mouse.pageY);
	}
	else if(mouse.button==0&&mouse.ctrlKey){
		ZOOM_FLAG=true;
		zo_start = new Vector(mouse.pageX,mouse.pageY,1);
	}
	return false;
}

function mouseDragged(mouse){
	if (ROTATION_FLAG){
		if(mouse['touches'])
			rot_end = computeSphereVector(mouse['touches'][0].pageX, mouse['touches'][0].pageY); //compute where on the arcball the mouse ended up;
		else
			rot_end = computeSphereVector(mouse.pageX, mouse.pageY); //compute where on the arcball the mouse ended up;

		delta_quaternion = new Quaternion(Vector.dot(rot_start,rot_end),rot_start.cross(rot_end)); //compute the corresponding quaternion;
		camera.quaternion=current_quaternion = delta_quaternion.mult(current_quaternion).normalize();
		rot_start = rot_end;    
		render();
	}
	else if(ZOOM_FLAG){
		zo_end = new Vector(mouse.pageX, mouse.pageY,1);
		var delta_zoom = new Vector(zo_start.x - zo_end.x, zo_start.y - zo_end.y,1);
		zoom+=delta_zoom.y*0.002;
		zo_start=zo_end;
		render();
	}
}

function mouseReleased(mouse){
	ROTATION_FLAG&&(ROTATION_FLAG=false);
	ZOOM_FLAG&&(ZOOM_FLAG=false);
	rot_start=rot_end;
} 

function keyDown(key){
	if(!ROTATION_FLAG){
		if(key.keyCode==97)
			current_quaternion=goal_quaternions[2];
		if(key.keyCode==99)
			current_quaternion=goal_quaternions[1];
		if(key.keyCode==103)
			current_quaternion=goal_quaternions[0];
		render();
	}
}

var cubes  = []; 
cubes[0] = new Cube(0,0,0,70, new color(100,0,0), new color(255));
//cubes[1] = new Cube(150,0,0,40, new color(255,1,1), new color(255));
//cubes[2] = new Cube(0,150,0,40, new color(0,255,0), new color(255));
//cubes[3] = new Cube(0,0,150,40, new color(0,0,255), new color(255));
for(var i=0;i<cubes.length;i++){
	scene.addObject(cubes[i]);
}
var l=new Light(255,1);
scene.addLight(l);
function render(){  
	if(context){
		context.clearRect(-innerWidth/2,-innerHeight/2,innerWidth,innerHeight);
		renderer.render(scene,camera);
	}
}
/**
 * Beräkning av x och y muspositioner
 */ 
function computeSphereVector(x, y){
	var g = width/5.0;           //radien av sfären/globen

	var pX = (x-width/2.0)/g;    
	var pY = (y-height/2.0)/g;
	var L2 = pX*pX + pY*pY;
	if (L2>=1&&0) {
		var ans = new Vector(pX, pY, 0); 
		ans.normalize();
		return ans;
	} 
	else{
		var pZ = Math.sqrt(1); 
		return new Vector(pX, pY, pZ);
	}  
} 