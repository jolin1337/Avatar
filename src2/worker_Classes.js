/**
 * @author Johannes Lindén / http://solidcloud.se/
 */

var Vector = function(x, y, z) {
	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;
	if(arguments.length==1&&typeof x=='object'){
		this.x=x.x;
		this.y=x.y;
		this.z=x.z;
	}
};
Vector.Init=function(){return new Vector(1,1,1);}
// Common vector operations for Vector
Vector.prototype = {
	data:function(){
		return {x:this.x,y:this.y,z:this.z};
	},
	parseVector:function(v){
		if(!(v.x  && v.y && v.z))return false;
		this.x = v.x;
		this.y = v.y;
		this.z = v.z;
		return this;
	},
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
		} 
		else if (arguments.length === 1) {
			this.x -= v.x;
			this.y -= v.y;
			this.z -= v.z;
		}
		return this;
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
		return this;
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
		return this;
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
	abs:function(){
		return new Vector( Math.abs(this.x), Math.abs(this.y), Math.abs(this.z) );
	},
	normalize: function() {
		var m = this.mag();
		if (m > 0) {
			this.div(m);
		}
		return this;
	},
	limit: function(high) {
		if (this.mag() > high) {
			this.normalize();
			this.mult(high);
		}
	},
	invert: function(){
		this.x*=-1;
		this.y*=-1;
		this.z*=-1;
		return this;
	},
	heading2D: function() {
		return (-Math.atan2(-this.y, this.x));
	},
	makeReal:function(){
		this.x=parseInt(this.x);
		this.y=parseInt(this.y);
		this.z=parseInt(this.z);
		return this;
	},
	toString: function() {
		return "[" + (this.x<0?"":" ") + Math.floor(this.x*100)/100 + ", " + (this.y<0?"":" ") + Math.floor(this.y*100)/100 + ", " + (this.z<0?"":" ") + Math.floor(this.z*100)/100 + "]";
	},
	array: function() {
		return [this.x, this.y, this.z];
	}
};
Vector.angleBetween = function(v1, v2) {
  return Math.acos(v1.dot(v2) / (v1.mag() * v2.mag()));
};

var color=function(r,g,b){
	if(arguments.length==3){
		this.r = r || 0;
		this.g = g || 0;
		this.b = b || 0;
	}
	else if(arguments.length==1&&typeof r == "string"){
		this.r=r[1]+r[2];
		this.g=r[3]+r[4];
		this.b=r[5]+r[6];
	}
	else if(arguments.length == 1)
		this.r = this.g = this.b = r;
	else
		this.r = this.g = this.b = 0;
	this.a = 1;
	this.clone=function(){return new color(this.r,this.g,this.b);}
	this.multiply=function(v){
		v=v<=0?v*-1:v;
		this.r*=v;
		this.g*=v;
		this.b*=v;
		return this;
	};
	this.toStyle=function(undefined){
		try{
			if(ThemeView3D.opacity!==undefined)
				return "rgba("+parseInt(this.r,10)%256+","+parseInt(this.g,10)%256+","+parseInt(this.b,10)%256+","+(this.a?this.a:ThemeView3D.opacity)+")";
			else
				throw "Error";
		}
		catch(e){
			return "rgba("+parseInt(this.r,10)%256+","+parseInt(this.g,10)%256+","+parseInt(this.b,10)%256 + "," + this.a + ")";	
		}
	};
	this.toString=function(){
		return "Color";
	}
};

var Material = function(){
	color.apply(this, arguments);
	this.image=null;
	this.toString=function(){
		return "Material";
	}
};

var Object3D = function(){
	this.position=null;
	this.fillCol=null;
	this.id="";
	this.Faces=null;
	this.constructor = this;
};
var Curve3D = function(){
	this.position=null;
	this.strokeCol=null;
	this.id="";
	this.Faces=null;
};
var Cube = function(x,y,z,size,color,strokeCol){
	if(CubeCount<10) this.id="Cube.00"+(++CubeCount);
	else if(CubeCount<100)this.id="Cube.0"+(++CubeCount);
	else this.id="Cube."+(++CubeCount);
	this.position=new Vector(x,y,z);
	this.fillCol=color||new window.color(100,0,0);
	this.strokeCol=strokeCol||0;
	var D = size/2;
	this.vertices=[
			new Vertex(1*D,1*D,1*D),	//0
			new Vertex(-1*D,1*D,1*D),	//1
			new Vertex(-1*D,1*D,-1*D),	//2
			new Vertex(1*D,1*D,-1*D),	//3

			new Vertex(-1*D,-1*D,1*D),	//4
			new Vertex(1*D,-1*D,1*D),	//5
			new Vertex(1*D,-1*D,-1*D),	//6
			new Vertex(-1*D,-1*D,-1*D)	//7
	];
	this.Faces=[
			//positive
		new Face(new Vertex(1*D,1*D,1*D),new Vertex(-1*D,1*D,1*D),new Vertex(-1*D,1*D,-1*D),new Vertex(1*D,1*D,-1*D)),	// side
		new Face(new Vertex(1*D,1*D,1*D),new Vertex(-1*D,1*D,1*D),new Vertex(-1*D,-1*D,1*D),new Vertex(1*D,-1*D,1*D)),	// top
		new Face(new Vertex(1*D,1*D,1*D),new Vertex(1*D,-1*D,1*D),new Vertex(1*D,-1*D,-1*D),new Vertex(1*D,1*D,-1*D)),	// front
			//negative
		new Face(new Vertex(1*D,-1*D,-1*D),new Vertex(-1*D,-1*D,-1*D),new Vertex(1*D,-1*D,1*D),new Vertex(-1*D,-1*D,1*D)),	//side
		new Face(new Vertex(-1*D,-1*D,-1*D),new Vertex(1*D,-1*D,-1*D),new Vertex(1*D,1*D,-1*D),new Vertex(-1*D,1*D,-1*D)),	//top
		new Face(new Vertex(-1*D,-1*D,-1*D),new Vertex(-1*D,1*D,-1*D),new Vertex(-1*D,1*D,1*D),new Vertex(-1*D,-1*D,1*D)),	//front
	];
	var index=[];
	for(var i=0;i<4;i++)
		this.Faces[0].vertices[i]=this.vertices[i];
	
	index=[
		0,1,2,3,
		1,0,5,4,
		5,0,3,6,
		6,7,4,5,
		7,6,3,2,
		7,2,1,4
	];
	for(var j=0;j<6;j++){
		for(var i=0;i<4;i++)
			this.Faces[j].vertices[i]=this.vertices[index[j*4+i]];
	}
	this.constructor=new Object3D;
	//this.Faces[5].normal.invert();
};
var CubeCount=0;
var Plane= function(x,y,z,size,color,strokeCol){
	if(Plane.count<10) this.id="Plane.00"+(++Plane.count);
	else if(Plane.count<100)this.id="Plane.0"+(++Plane.count);
	else this.id="Plane."+(++Plane.count);
	this.position=new Vector(x,y,z);
	this.fillCol=color||new window.color(100,0,0);
	this.strokeCol=strokeCol||0;
	var D = size/2;
	
	this.Faces=[
		new Face(new Vertex(-D,D,0),new Vertex(D,D,0),new Vertex(D,-D,0),new Vertex(-D,-D,0)),	// side
	];
	this.constructor=new Object3D;
};
Plane.count=0;
var Circle=function(x,y,z,radius,detail,color,strokeCol){
	if(Circle.count<10) this.id="Circle.00"+(++Circle.count);
	else if(Circle.count<100)this.id="Circle.0"+(++Circle.count);
	else this.id="Circle."+(++Circle.count);
	this.position=new Vector(x,y,z);
	this.fillCol=color||new window.color(100,0,0);
	this.strokeCol=strokeCol||0;
	this.vertices=[
		new Vertex(x,y,z)
	];
	this.Faces=[];
	for(var i=0;i<=(Math.PI*2);i+=Math.PI*2/detail){
		this.vertices.push(new Vertex(Math.cos(i)*radius,Math.sin(i)*radius,z));
	}
	for(var i=0;i<detail;i++){
		this.Faces.push(
			new Face(this.vertices[0],this.vertices[i],this.vertices[i+1])
		);
	}
	this.Faces.push(
		new Face(this.vertices[1],this.vertices[0],this.vertices[this.vertices.length-2])
	);
	this.constructor=new Object3D;
};
Circle.count=0;
var Cylinder=function(x,y,z,radius,height,detail,color,strokeCol){
	if(Cylinder.count<10) this.id="Cylinder.00"+(++Cylinder.count);
	else if(Cylinder.count<100)this.id="Cylinder.0"+(++Cylinder.count);
	else this.id="Cylinder."+(++Cylinder.count);
	this.position=new Vector(x,y,z);
	this.fillCol=color||new window.color(100,0,0);
	this.strokeCol=strokeCol||0;
	var top=new Circle(x,y,z+height/2,radius,detail,color,strokeCol);
	var bottom=new Circle(x,y,z-height/2,radius,detail,color,strokeCol);
	Circle.count-=2;

	for(var i=0;i<bottom.Faces.length;i++)
		bottom.Faces[i].flipNormal();
	this.vertices=top.vertices.concat(bottom.vertices);
	this.Faces=[];
	this.Faces=top.Faces.concat(bottom.Faces);
	for(var i=1;i<detail;i++)
		this.Faces.push(
			new Face(top.vertices[i],top.vertices[i+1],bottom.vertices[i+1],bottom.vertices[i])
		);
	
	this.Faces.push(
		new Face(top.vertices[top.vertices.length-2],top.vertices[1],bottom.vertices[1],bottom.vertices[bottom.vertices.length-2])
	);
	this.constructor=new Object3D;
};
Cylinder.count=0;
var Test=function(x,y,z,color,strokeCol){
	if(Test.count<10) this.id="Test.00"+(++Test.count);
	else if(Test.count<100)this.id="Test.0"+(++Test.count);
	else this.id="Test."+(++Test.count);

	this.position=new Vector(x,y,z);
	this.fillCol=color||new window.color(100,0,0);
	this.strokeCol=strokeCol||0;
	/*this.Faces=[
		new Face(new Vertex(-100,100,100),new Vertex(100,-100,-100),new Vertex(-100,-100,-100)),
		new Face(new Vertex(-100,-100,100),new Vertex(100,100,-100),new Vertex(-100,100,-100))
	];*/
	/*this.Faces=[
		new Face(new Vertex(0,100,0),new Vertex(100,-100,0),new Vertex(-100,-100,0)),
		new Face(new Vertex(50,-100,100),new Vertex(0,0,-100),new Vertex(0,0,100))
		];*/
	this.Faces=[
		new Face(new Vertex(-100,100,50),new Vertex(-100,-100,100),new Vertex(0,-100,-100)),
		new Face(new Vertex(-200,-50,0),new Vertex(-200,200,0),new Vertex(0,-200,0))
	];
	this.constructor=new Object3D;
}
Test.count=0;
var TriForce=function(x,y,z,scale,color){
	if(TriForce.count<10) this.id="Object.00"+(++TriForce.count);
	else if(TriForce.count<100)this.id="Object.0"+(++TriForce.count);
	else TriForce.id="Object."+(++TriForce.count);

	this.position=new Vector(x,y,z);
	this.fillCol=color||new window.color(100,0,0);
	this.strokeCol=0;
	var hyp = Math.sqrt(scale*scale-scale*scale/2);
	this.Faces=[
		new Face(new Vertex(0,hyp,0),new Vertex(-scale/2,0,0),new Vertex(scale/2,0,0)),
		new Face(new Vertex(-scale/2,0,0),new Vertex(-scale,-hyp,0),new Vertex(0,-hyp,0)),
		new Face(new Vertex(scale/2,0,0),new Vertex(scale,-hyp,0),new Vertex(0,-hyp,0))
	];
	this.constructor=new Object3D;
};
TriForce.count=0;
var BeizerCurve=function(x,y,z){
	if(BeizerCurve.count<10) this.id="Object.00"+(++BeizerCurve.count);
	else if(BeizerCurve.count<100)this.id="Object.0"+(++BeizerCurve.count);
	else BeizerCurve.id="Object."+(++BeizerCurve.count);

	this.position=new Vector(x,y,z);
	this.strokeCol=new color(1,1,1);
	this.Faces=[
		new VertexC( new Vector(-200,0,-100), new Vertex(-100,100,50), new Vertex(100,-100,-50) ),
		new VertexC( new Vector(200,0,0), new Vertex(100,-100,50), new Vertex(-100,100,-50) ),
		new VertexC( new Vector(-200,0,100), new Vertex(-100,100,50), new Vertex(100,-100,-50) )
	];
	this.Faces[0].handles[0].activeSpline = true;
	this.constructor=new Curve3D;
};
BeizerCurve.count=0;
var Curve=function(vc1,vc2){
	if(arguments.length==2)
		this.vertices=[vc1,vc2];
	else if(arguments.length==1&&vc1 instanceof [])
		this.vertices=vc1;
	else this.vertices=[];
	this.normal=null;
};
var Vertex=function(v,x,y){
	this.normal=null;
	this.position=v instanceof Vector?v:new Vector(v,x,y);
	this.screen=new Vector;
	this.worldPosition=new Vector;
	this.data=function(){
		return {
			position:this.position?this.position.data():null,
			normal:this.normal?this.normal.data():null,
			screen:this.screen?this.screen.data():null,
			worldPosition:this.worldPosition?this.worldPosition.data():null
		};	
	};
	this.toString=function(){
		return "new Vertex()";
	}
};
var VertexC=function(v1,v2,v3) {
	this.normal=null;
	this.screen=new Vector();
	this.worldPosition=new Vector();
	if(v1 instanceof Vector)
		this.position=v1||new Vector();
	else if(v1 instanceof VertexC){
		this.position = v1.position.clone();
		this.worldPosition = v1.worldPosition.clone();
		this.screen = v1.screen.clone();
		this.handles = [v1.handles[0],v1.handles[1]];
	}
	else this.position=new Vector();
	if( arguments.length==3 || arguments.length==2 )
		this.handles=v2 instanceof Array?v2:[v2,v3];
	else if(!(v1 instanceof VertexC)) this.handles=[];
	this.toString=function(){
		return "new VertexC()";
	}
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
	else if(arguments.length===1&&a instanceof Array){
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
		else this.vertices=[];
	}
	else
		this.vertices=[];
	this.calculatePosition=function(){
		var m=0,n=0,j=0;
		for(var i=0;i<this.vertices.length;i++){
			m+=this.vertices[i].position.x,
			n+=this.vertices[i].position.y,
			j+=this.vertices[i].position.z;
		}
		return new Vector(m/this.vertices.length,n/this.vertices.length,j/this.vertices.length);
	}
	this.position=this.calculatePosition();
	
	this.calculateNormal=function(){
		if(!(this.vertices instanceof Array&&this.vertices[0] instanceof Vertex&&this.vertices[2] instanceof Vertex))return false;
		var v=new Vector(0,0,0);
		if(this.vertices.length==4){
			for(var i=1;i<2;i+=4){
				if(!(this.vertices[i] instanceof Vertex)){return false;}
				var v1=Vector.sub(this.vertices[0].position,this.vertices[i].position);				//V1
				var v2=Vector.sub(this.vertices[2].position,this.vertices[i].position);				//V2
				var vn=v1.cross(v2);
				vn.normalize();
				v.add(vn);
			}
		}
		else if(this.vertices.length==3){
			var v1=Vector.sub(this.vertices[1].position,this.vertices[0].position);				//V1
			var v2=Vector.sub(this.vertices[2].position,this.vertices[0].position);				//V2
			var v=v1.cross(v2);
		}
		else v=false;
		v&&v.normalize();
		return new Vertex(v);
	};
	this.getOffset=function () {
		return this.normal.position.clone().mult(this.vertices[0].position);
	};
	this.testColor="rgb("+parseInt(255*Math.random())+","+parseInt(255*Math.random())+","+parseInt(255*Math.random())+")";
	if(this.vertices.length)
		this.normal=this.calculateNormal();
	else
		this.normal=null;
};
Face.prototype={
	flipNormal:function () {
		var temp=this.vertices[1];
		this.vertices[1]=this.vertices[2];
		this.vertices[2]=temp;
		if(this.vertices.length==4){
			var temp=this.vertices[2];
			this.vertices[2]=this.vertices[3];
			this.vertices[3]=temp;
		}
		this.normal=this.calculateNormal();
	},
	intersectPoint:function(v){
		if(v instanceof Vertex)
			v=v.position;
		if(v instanceof Vector){
			try{
				if(!(this.normal instanceof Vertex))
					this.normal=this.calculateNormal();
				if(this.normal instanceof Vertex)
					return (this.normal.position.dot( Vector.sub(this.vertices[0].position,v) ))/this.normal.position.mag();
				else
					throw "this.normal = "+this.normal + ";";
			}
			catch (e){
				if(typeof e == "string")
					console.error("Incorrect normal: ",e);
				else console.error(e);
				return 0;
			}
		}
		return null;
	},
	intersectLine:function(l){
		if(l instanceof Face && l.vertices.length==2){
			l=l.vertices;
		}
	},
	intersectTriangle: function(p){
		function Side(p1,p2,a,b){
			cp1 = Vector.cross(Vector.sub(b,a),Vector.sub(p1,a));
			cp2 = Vector.cross(Vector.sub(b,a),Vector.sub(p2,a));
			if( cp1.dot(cp2) >= 0) return true;
			return false;
		}
		var a=this.vertices[0],
			b=this.vertices[1],
			c=this.vertices[2];
		if(Side(p,a,b,c) && Side(p,b,a,c) && Side(p,c,a,b))return true;
		return false;
	}
};

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
	this.toAxisAngle=function(){
		if(this.w > 1) this.normalize();
		var angle = this.angle();
		var s = Math.sqrt(1 - this.x*this.x);
		try{
			return new Quaternion(angle,this.u.x / s, this.u.y / s, this.u.z / s);
		}catch(e){
			return new Quaternion(angle,this.u.x, this.u.y, this.u.z);
		}
	};
	this.toEulerAngles=function(){
		if(this.w > 1) this.normalize();
		var test = this.u.x*this.u.y + this.u.z*this.x;
		if( test > 0.499 )   // north pole
			return new Vector( 0, Math.PI/2, 2 * Math.atan2(this.u.x, this.x) );
		else 
			return new Vector( 0, -Math.PI/2, - 2 * Math.atan2(this.u.x, this.x) );
		var sqx = this.u.x*this.u.x;
		var sqy = this.u.y*this.u.y;
		var sqz = this.u.z*this.u.z;
		return new Vector(
			Math.atan2(2*this.u.x*this.x - 2*this.u.y*this.u.z, 1- 2*sqx - 2*sqz),
			Math.asin(2*test),
			Math.atan2(2*this.u.y*this.x - 2*this.u.x*this.u.z, 1- 2*sqy - 2*sqz )
		);
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
	// depricated
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
	this.to4x4Matrix=function() {
		var xx	  = this.u.x * this.u.x,
			xy	  = this.u.x * this.u.y,
			xz	  = this.u.x * this.u.z,
			xw	  = this.u.x * this.x,
			yy	  = this.u.y * this.u.y,
			yz	  = this.u.y * this.u.z,
			yw	  = this.u.y * his.x,
			zz	  = this.u.z * this.u.z,
			zw	  = this.u.z * his.x;
		var mat=[];
		mat[0]=[];
		mat[1]=[];
		mat[2]=[];
		mat[3]=[];
		mat[0][0]  = 1 - 2 * ( yy + zz );
		mat[0][1]  =	 2 * ( xy - zw );
		mat[0][2]  =	 2 * ( xz + yw );
		mat[1][0]  =	 2 * ( xy + zw );
		mat[1][1]  = 1 - 2 * ( xx + zz );
		mat[1][2]  =	 2 * ( yz - xw );
		mat[2][0]  =	 2 * ( xz - yw );
		mat[2][1]  =	 2 * ( yz + xw );
		mat[2][2]  = 1 - 2 * ( xx + yy );
		mat[0][3]  = mat[1][3] = mat[2][3] = mat[3][0] = mat[3][1] = mat[3][2] = 0;
		mat[3][3] = 1;
		mat.toQuaternion=function () {
			var X,Y,Z,W;
			if ( this[0] > this[5] && this[0] > this[10] )  {	// Column 0: 
				var S  = sqrt( 1.0 + this[0] - this[5] - this[10] ) * 2;
				X = 0.25 * S;
				Y = (this[4] + this[1] ) / S;
				Z = (this[2] + this[8] ) / S;
				W = (this[9] - this[6] ) / S;
			} 
			else if ( this[5] > this[10] ) {					// Column 1: 
				var S  = sqrt( 1.0 + this[5] - this[0] - this[10] ) * 2;
				X = (this[4] + this[1] ) / S;
				Y = 0.25 * S;
				Z = (this[9] + this[6] ) / S;
				W = (this[2] - this[8] ) / S;
			} 
			else {												// Column 2:
				var S  = sqrt( 1.0 + this[10] - this[0] - this[5] ) * 2;
				X = (this[2] + this[8] ) / S;
				Y = (this[9] + this[6] ) / S;
				Z = 0.25 * S;
				W = (this[4] - this[1] ) / S;
			}
			return new Quaternion(W,X,Y,Z);
		}
		return mat;
	};
	// pending...
	this.rotateAxis=function(angle,axis){
		axis.normalize();
		var sa=Math.sin(angle/2);
		var ca=Math.cos(angle/2);
		this.u.x=axis.x*sa;
		this.u.y=axis.y*sa;
		this.u.z=axis.z*sa;
		this.x=ca;
		this.normalize();
		return this;
	};
	this.toString=function(){
		return "new Quaternion( "+this.x+","+this.u.x+","+this.u.y+","+this.u.z+" ) ";
	};
	this.data=function(){
		return {x:this.x,u:this.u.data()};
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

var Ray = function(ray){
	this.point1 = new Vertex;
	this.point2 = new Vertex;
	this.shape = "Circle";
	this.radius = 20;
	this.toString= function(){
		return "RAY";
	}
};
Ray.prototype.calcRay = function(first_argument) {
	// body...
};

if(self["window"]) {
	/*
	 * 
	 * drop.js v0.3
	 * This code below is: Copyright 2012, Johan Lindskogen
	 *
	 * Useage: drop( element, callback(fileData) )
	 * fileData.read will contain a string with the fileData
	 * 
	 */

	function drop(zone, callback) {
		var fileData = {};
		function cancel(event) {
			event.stopPropagation();
			event.preventDefault();
		}
		zone.addEventListener('dragenter', cancel, true);
		zone.addEventListener('dragexit', cancel, true);
		zone.addEventListener('dragover', cancel, true);
		zone.addEventListener('drop', function(event) {
			cancel(event);
			var files = event.dataTransfer.files;
			for (var i = 0, len = files.length; i < len; i++){
				fileData = {
					name: files[i].name,
					size: files[i].size,
					date: files[i].lastModifiedDate,
					type: files[i].type,
					originalFile: files[i]
				};
				readFile(files[i]);
			}
		}, false);
		function readFile(file) {
			var reader = new FileReader();
			reader.onload = handleResult;
			if (file.type.indexOf('image') != -1)
				reader.readAsDataURL(file);
			else
				reader.readAsText(file);
		}
		function handleResult(event) {
			fileData.read = event.target.result;
			callback(fileData);
		}
	}
}
function Load_obj(data) {
	// build vertex and face arrays and normals


	Array.prototype.clean = function(deleteValue) {
		for (var i = 0; i < this.length; i++) {
			if (this[i] == deleteValue) {         
				this.splice(i, 1);
				i--;
			}
		}
		return this;
	};

	var vertexes  = [];
	var normals   = [];
	var faces     = [];

	var face_indices = [];
	var face_indices_vertexes = [];

	var face_vertexes = [];

	var normals_faces = [];
	var normal_numbers = [];
	var normals_pers = [];

	data_Test = data.split('\n');
	//console.log(stl_data);
	blend=false;
	for(var i=0;i<data_Test.length;i++){
		data_Test[i]=data_Test[i].toLowerCase();
		if(data_Test[i].indexOf('Blender')!=-1){
			blend=true;
		}
		if(data_Test[i][0]=='v' && data_Test[i][1]!='n'){
			face_vertexes.push(data_Test[i]);
		}
		if(data_Test[i][0]=='f' || data_Test[i][0]=='F'){
			face_indices_vertexes.push(data_Test[i]);
		}
		if((data_Test[i][0]=='v' && data_Test[i][1]=='n')){
			var r = data_Test[i].split(' ').clean("");
			normals_faces.push([r[1],r[2],r[3]]);
		}
	}
	//console.log(normals_faces);

	for(var i=0;i<face_vertexes.length;i++){
		var r = face_vertexes[i].split(' ').clean("");
		vertexes.push(
			new Vertex(
				parseFloat(r[1]),
				parseFloat(r[2]),
				parseFloat(r[3])
			).data()
		);
	}
	//console.log(vertexes);

	for(var i=0;i<face_indices_vertexes.length;i++){
		var r = face_indices_vertexes[i].split(' ').clean("");
		switch(r.length){
			case 5:// 4 vertices
				face_indices.push([
					parseInt(r[1].split('/')[0])-1,
					parseInt(r[2].split('/')[0])-1,
					parseInt(r[3].split('/')[0])-1,
					parseInt(r[4].split('/')[0])-1
				]);
				normal_numbers.push([
					parseInt(r[1].split('/')[2])-1,
					parseInt(r[2].split('/')[2])-1,
					parseInt(r[3].split('/')[2])-1,
					parseInt(r[4].split('/')[2])-1
				]);
				break;
			case 4:	// 3 vertices
				face_indices.push([
					parseInt(r[1].split('/')[0])-1,
					parseInt(r[2].split('/')[0])-1,
					parseInt(r[3].split('/')[0])-1
				]);
				normal_numbers.push([
					parseInt(r[1].split('/')[2])-1,
					parseInt(r[2].split('/')[2])-1,
					parseInt(r[3].split('/')[2])-1
				]);
				break;
			case 3: // 2 vertices
				face_indices.push([
					parseInt(r[1].split('/')[0])-1,
					parseInt(r[2].split('/')[0])-1
				]);
				normal_numbers.push([
					parseInt(r[1].split('/')[2])-1,
					parseInt(r[2].split('/')[2])-1
				]);
				break;
			default:
				console.log(r);
				face_indices.push([0,0,0,0]);
				normal_numbers.push([0,0,0,0]);
		}
	}
	//console.log(normal_numbers);
	for(var k=0;k<face_indices.length;k++){
		faces.push(vertexes[parseInt(face_indices[k][0])]);

		if(parseInt(face_indices[k].length)==2)
			faces.push(vertexes[parseInt(face_indices[k][1])]);
		if(parseInt(face_indices[k].length)==3)
			faces.push(vertexes[parseInt(face_indices[k][2])]);
		if(parseInt(face_indices[k].length)==4)
			faces.push(vertexes[parseInt(face_indices[k][3])]);
			normals[k]=normals_faces.splice(k,1,"done")[0];
	}

	return [vertexes, normals, face_indices];
};