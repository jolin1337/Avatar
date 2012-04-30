/**
 * @author Johannes Lindén / http://solidcloud.se/
 */

var Vector = function(x, y, z) {
	if(arguments.length==3){
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
	}
	else if(arguments.length==1&&typeof x=='object'){
		this.x=x.x;
		this.y=x.y;
		this.z=x.z;
	}
	this.data=function(){
		return{x:this.x,y:this.y,z:this.z};
	};
};
var Vector2d = function(x, y) {
	if(arguments.length==2){
		this.x = x || 0;
		this.y = y || 0;
	}
	else if(arguments.length==1&&typeof x=='object'){
		this.x=x.x;
		this.y=x.y;
	}
	this.data=function(){
		return{x:this.x,y:this.y};
	};
};


Vector2d.prototype = {
  clone:function(){return new Vector2d(this.x,this.y);},
  set: function(v, y) {
	if (arguments.length === 1) {
	  this.set(v.x || v[0], v.y || v[1]);
	} 
	else {
	  this.x = v;
	  this.y = y;
	}
  },
  get: function() {
	return new Vector(this.x, this.y);
  },
  mag: function() {
	return Math.sqrt(this.x * this.x + this.y * this.y);
  },
  add: function(v, y) {
	if (arguments.length === 2) {
	  this.x += v;
	  this.y += y;
	} 
	else if (arguments.length === 1) {
	  this.x = this.x + v.x;
	  this.y = this.y + v.y;
	}
	return this;
  },
  sub: function(v, y) {
	if (arguments.length === 2) {
	  this.x -= v;
	  this.y -= y;
	} 
	else if (arguments.length === 1) {
	  this.x -= v.x;
	  this.y -= v.y;
	}
  },
  mult: function(v) {
	if (typeof v === 'number') {
	  this.x *= v;
	  this.y *= v;
	} 
	else if (typeof v === 'object') {
	  this.x *= v.x;
	  this.y *= v.y;
	}
  },
  div: function(v) {
	if (typeof v === 'number') {
	  this.x /= v;
	  this.y /= v;
	} 
	else if (typeof v === 'object') {
	  this.x /= v.x;
	  this.y /= v.y;
	}
  },
  dist: function(v) {
	var dx = this.x - v.x,
		dy = this.y - v.y;
	return Math.sqrt(dx * dx + dy * dy );
  },
  dot: function(v, y) {
	if (arguments.length === 2) {
	  return (this.x * v + this.y * y);
	} 
	else if (arguments.length === 1) {
	  return (this.x * v.x + this.y * v.y);
	}
  },
  normalize: function() {
	var m = this.mag();
	if (m > 0) {
	  this.div(m);
	}
  },
  limit: function(high) {
	if (this.mag() > high) {
	  this.normalize();
	  this.mult(high);
	}
  },
  angle: function() {
	var a= (-Math.atan2(-this.y, this.x)/(Math.PI/180));
	return a<0?360+a:a;
  },
  toString: function() {
	return "[" + this.x + ", " + this.y + "]";
  },
  array: function() {
	return [this.x, this.y];
  }
};
Vector2d.add=function(v1,v2){
	return new Vector2d(v1.x+v2.x,v1.y+v2.y);
}
Vector2d.sub=function(v1,v2){
	return new Vector2d(v1.x-v2.x,v1.y-v2.y);
}
Vector2d.mult=function(v1,v2){
	return new Vector2d(v1.x*v2.x,v1.y*v2.y);
}
Vector2d.div=function(v1,v2){
	return new Vector2d(v1.x/v2.x,v1.y/v2.y);
}
// Common vector operations for Vector
Vector.prototype = {
  clone:function(){return new Vector(this.x,this.y,this.z);},
  set: function(v, y, z) {
	if (arguments.length === 1) {
	  this.set(v.x || v[0], v.y || v[1], v.z || v[2]);
	} else {
	  this.x = v;
	  this.y = y;
	  this.z = z;
	}
  },
  get: function() {
	return new Vector(this.x, this.y, this.z);
  },
  mag: function() {
	return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  },
  add: function(v, y, z) {
	if (arguments.length === 3) {
	  this.x += v;
	  this.y += y;
	  this.z += z;
	} 
	else if (arguments.length === 1) {
	  this.x = this.x + v.x;
	  this.y = this.y + v.y;
	  this.z = this.z + v.z;
	}
	return this;
  },
  sub: function(v, y, z) {
	if (arguments.length === 3) {
	  this.x -= v;
	  this.y -= y;
	  this.z -= z;
	} else if (arguments.length === 1) {
	  this.x -= v.x;
	  this.y -= v.y;
	  this.z -= v.z;
	}
  },
  mult: function(v) {
	if (typeof v === 'number') {
	  this.x *= v;
	  this.y *= v;
	  this.z *= v;
	} 
	else if (typeof v === 'object') {
	  this.x *= v.x;
	  this.y *= v.y;
	  this.z *= v.z;
	}
  },
  div: function(v) {
	if (typeof v === 'number') {
	  this.x /= v;
	  this.y /= v;
	  this.z /= v;
	} 
	else if (typeof v === 'object') {
	  this.x /= v.x;
	  this.y /= v.y;
	  this.z /= v.z;
	}
  },
  dist: function(v) {
	var dx = this.x - v.x,
		dy = this.y - v.y,
		dz = this.z - v.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },
  dot: function(v, y, z) {
	if (arguments.length === 3) {
	  return (this.x * v + this.y * y + this.z * z);
	} 
	else if (arguments.length === 1) {
	  return (this.x * v.x + this.y * v.y + this.z * v.z);
	}
  },
  cross: function(v) {
	return new Vector(this.y * v.z - v.y * this.z,
					   this.z * v.x - v.z * this.x,
					   this.x * v.y - v.x * this.y);
  },
  normalize: function() {
	var m = this.mag();
	if (m > 0) {
	  this.div(m);
	}
  },
  limit: function(high) {
	if (this.mag() > high) {
	  this.normalize();
	  this.mult(high);
	}
  },
  heading2D: function() {
	return (-Math.atan2(-this.y, this.x));
  },
  toString: function() {
	return "[" + this.x + ", " + this.y + ", " + this.z + "]";
  },
  array: function() {
	return [this.x, this.y, this.z];
  }
};
Vector.angleBetween = function(v1, v2) {
  return Math.acos(v1.dot(v2) / (v1.mag() * v2.mag()));
};

var color=function(r,g,b){
	if(arguments.length===3){
		this.r=r||0;
		this.g=g||r||0;
		this.b=b||r||0;
	}
	else if(arguments.length==1&&typeof r == "string"){
		this.r=r[1]+r[2];
		this.g=r[3]+r[4];
		this.b=r[5]+r[6];
	}
	this.clone=function(){return new color(this.r,this.g,this.b);}
	this.multiply=function(v){
		v=v<=0?v*-1:v;
		this.r*=v;
		this.g*=v;
		this.b*=v;
		return this;
	};
	this.toStyle=function(){
		return "rgba("+parseInt(this.r,10)%255+","+parseInt(this.g,10)%255+","+parseInt(this.b,10)%255+",1)";
	};
};
var Cube = function(x,y,z,size,color,strokeCol){
	if(CubeCount<10) this.id="Cube.00"+(++CubeCount);
	else if(CubeCount<100)this.id="Cube.0"+(++CubeCount);
	else this.id="Cube."+(++CubeCount);
	this.center=new Vector(x,y,z);
	this.position=new Vector(x,y,z);
	this.fillCol=color||new color(100,0,0);
	this.strokeCol=strokeCol||0;
	this.faces=[[0,4,6,2],[1,3,7,5],[0,1,5,4],[2,6,7,3],[0,2,3,1],[4,5,7,6]];
	this.getBit=function(N,i){
		var a=((N >>> i) & 1);
		if(!a)return -1;
		return 1;
	};
	var D = size/2;
	this.vertices=[];
	for(var i=0;i<8;i++){
		this.vertices.push(new Vector(this.center.x+this.getBit(i,0)*D,this.center.y+this.getBit(i,1)*D,this.center.z+this.getBit(i,2)*D));
	};
	this.Faces=[];
	/*for(var i=0;i<this.faces.length;i++){
		this.Faces.push(new Face(
			new Vector(
				this.center.x+this.getBit(i,0)*D,
				this.center.y+this.getBit(i,1)*D,
				this.center.z+this.getBit(i,2)*D
			),
			new Vector(
				this.center.x+this.getBit(i+1,0)*D,
				this.center.y+this.getBit(i+1,1)*D,
				this.center.z+this.getBit(i+1,2)*D
			),
			new Vector(
				this.center.x+this.getBit(i+2,0)*D,
				this.center.y+this.getBit(i+2,1)*D,
				this.center.z+this.getBit(i+2,2)*D
			),
			new Vector(
				this.center.x+this.getBit(i+3,0)*D,
				this.center.y+this.getBit(i+3,1)*D,
				this.center.z+this.getBit(i+3,2)*D
			)
		));
	}*/
	for(var i=0,j=0;j<8;i+=4,j++){
		this.vertices.push(new Vector(this.center.x+this.getBit(j,0)*D,this.center.y+this.getBit(j,1)*D,this.center.z+this.getBit(j,2)*D));
	};
	this.Faces=[
			//positive
		new Face(new Vertex(1*D,1*D,1*D),new Vertex(-1*D,1*D,1*D),new Vertex(-1*D,1*D,-1*D),new Vertex(1*D,1*D,-1*D)),	// side
		new Face(new Vertex(1*D,1*D,1*D),new Vertex(-1*D,1*D,1*D),new Vertex(-1*D,-1*D,1*D),new Vertex(1*D,-1*D,1*D)),	// top
		new Face(new Vertex(1*D,1*D,1*D),new Vertex(1*D,-1*D,1*D),new Vertex(1*D,-1*D,-1*D),new Vertex(1*D,1*D,-1*D)),	// front
			//negative
		new Face(new Vertex(-1*D,-1*D,-1*D),new Vertex(1*D,-1*D,-1*D),new Vertex(1*D,-1*D,1*D),new Vertex(-1*D,-1*D,1*D)),	//side
		new Face(new Vertex(-1*D,-1*D,-1*D),new Vertex(1*D,-1*D,-1*D),new Vertex(1*D,1*D,-1*D),new Vertex(-1*D,1*D,-1*D)),	//top
		new Face(new Vertex(-1*D,-1*D,-1*D),new Vertex(-1*D,1*D,-1*D),new Vertex(-1*D,1*D,1*D),new Vertex(-1*D,-1*D,1*D)),	//front
	];
	this.translate=function(u){
		for(var i=0;i<this.vertices.length;i++)
			this.vertices[i].add(u);
		this.center.add(u);
	};
	this.rotate=function(q,b){//b&&alert(q.u,this.vertices[0]);
		for(var i=0;i<this.vertices.length;i++)
			this.vertices[i] = q.actOn(this.vertices[i]);
		this.center = q.actOn(this.center);//b&&alert(q.u,this.center);
	};
	this.getFace=function(i,vert){
		var ans = [];
		for(var j=0;j<4;j++){
			if(!vert)
				var v= this.vertices[this.faces[i][j]];
			else
				var v=vert[this.faces[i][j]];
			ans[j] = new Vector(v.x,v.y,v.z);
		}
		return ans;
	};
	this.getPolygons=function(vert){
		/*var ans =[];
		for(var i=0;i<6;i++){
			ans[i] = this.getFace(i,vert);
		}
		*/
		return this.Faces;
	};
	this.paint=function(toScreen,f,scale){//alert("rgba("+this.fillCol.r+","+this.fillCol.g+","+this.fillCol+",1)");
		context.fillStyle="rgba("+this.fillCol.r+","+this.fillCol.g+","+this.fillCol.b+",1)";
		context.strokeStyle="rgba("+this.strokeCol.r+","+this.strokeCol.g+","+this.strokeCol.b+",1)";
		paintPolygons(projectPolygons(this.getPolygons(),f,scale),toScreen);
	};
};
var CubeCount=0;

var Vertex=function(v,x,y){
	this.normal=null;
	this.position=v instanceof Vector?v:new Vector(v,x,y);
	this.screen=new Vector;
	this.worldPosition=new Vector;
}
var Face=function(a,b,c,d){
	if(arguments.length==4){
		this.vertices=[a,b,c,d];
	}
	else if(arguments.length==3){
		this.vertices=[a,b,c];
	}
	else if(arguments.length==2){
		this.vertices=[a,b];
	}
	else if(arguments.length===1&&a instanceof Vector)
		this.vertices=[a];
	else if(arguments.length===1&&a instanceof []){
		if(a.length==4)
			this.vertices=[a[0],
						a[1],
						a[2],
						a[3]
			];
		else if(a.length==3)
			this.vertices=[a[0],
						a[1],
						a[2]
			];
		else this.vertices=[]
	}
	else
		this.vertices=[];
	this.calculateNormal=function(){
		if(!(this.vertices instanceof Array&&this.vertices[0] instanceof Vertex&&this.vertices[2] instanceof Vertex))return false;
		var v=new Vector(0,0,0);
		//try{
		if(this.vertices.length==4){
			for(var i=1;i<2;i+=4){
				if(!(this.vertices[i] instanceof Vertex)){return false;}
				var v1=Vector.sub(this.vertices[0].position,this.vertices[i].position);				//V1
				var v2=Vector.sub(this.vertices[2].position,this.vertices[i].position);				//V2
				var vn=v1.cross(v2);
				vn.normalize();
				v.add(vn);//console.log(v.toString(),vn.toString());
			}
		}
		else if(this.vertices.length==3){
			var v1=Vector.sub(this.vertices[1].position,this.vertices[0].position);				//V1
			var v2=Vector.sub(this.vertices[2].position,this.vertices[0].position);				//V2
			var v=v1.cross(v2);
		}
		else v=false;
		v&&v.normalize();
		return v;
	};
	this.testColor="rgb("+parseInt(255*Math.random())+","+parseInt(255*Math.random())+","+parseInt(255*Math.random())+")";
	this.normal=this.calculateNormal();
}
function Face4 () {
    var pointList = [];
    this.node = document.createElementNS('http://www.w3.org/2000/svg','polygon');
    function build (arg) {
        var res = [];
        for (var i=0,l=arg.length;i<l;i++) {
            res.push(arg[i].join(','));
        }
        return res.join(' ');
    }
    this.attribute = function (key,val) {
        if (val === undefined) return this.node.getAttribute(key);
        this.node.setAttribute(key,val);
    }
    this.getPoint = function (i) {return pointList[i]}
    this.setPoint = function (i,x,y) {
        pointList[i] = [x,y];
        this.attribute('points',build(pointList));
    }
	this.replacePoints = function (){
		for(var i=0,j=0,l=arguments.length;i<l;i+=2,j++){
			if(typeof pointList[j] == 'Array'&&pointList[j][0]==arguments[i]&&pointList[i][1]==arguments[i+1])
				continue;
			pointList[j]=[arguments[i],arguments[i+1]];
		}
		this.node.setAttribute('points',build(pointList));
	}
    this.points = function () {
		for (var i=0,l=arguments.length;i<l;i+=2) {
			pointList.push([arguments[i],arguments[i+1]]);
		}
		this.attribute('points',build(pointList));
    }
    // initialize 'points':
    this.points.apply(this,arguments);
}

var Quaternion=function(v,q,u,z){
	if(arguments.length==2){
		this.x=v;
		this.u=q||new Vector(0,0,0);
	}
	else if(arguments.length==4){
		this.x=v||0;
		this.u=new Vector(q||0,u||0,z||0);
	}
	else if(arguments.length==1&&typeof v=='object'){
		this.x=v.x;
		this.u=new Vector(v.u);
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
		var V= new Quaternion(0,v);
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
	this.toString=function(){
		return "hej"+this.u;
	}
	this.data=function(){
		return {x:this.x,u:this.u.data()};
	};
};


var Scene=function(s){
	if(arguments.length==0){
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
	}
	else if(typeof s=='object'){//alert(0);
		this.objects=[];
		this.lights=[];
		this.selected=s.selected;
		this.show=s.show;
	}//else return new Scene();
	this.data=function(){
		return {
			objects:this.objects.forEach(function(e,i,a){
				return (e=e.data());
			}),
			lights:this.lights,
			selected:this.selected,
			show:this.show
		};
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

var Camera=function(a,r){
	if(arguments.length==0){
		this.position	= new Vector(0,0,500);
		this.rotation	= new Vector(0,0,0);
		this.scale		= new Vector(1,1,1);
		this.lens		= 45;
		this.width		= "auto";
		this.height		= "auto";
		this.quaternion	= new Quaternion(-90,new Vector(-45,45/2,-45))
	}
	else if(typeof a =='object'){
		this.position	= new Vector(a.position);
		this.rotation	= new Vector(a.rotation);
		this.scale		= new Vector(a.scale);
		this.lens		= a.lens;
		this.width		= a.width;
		this.height		= a.height;
		this.quaternion	= new Quaternion(a.quaternion);
	}
	this.data=function(){
		return{
			position:this.position.data(),
			rotation:this.rotation.data(),
			scale:this.scale.data(),
			lens:this.lens,
			width:this.width,
			height:this.height,
			quaternion:this.quaternion.data()
		};
	};
};

