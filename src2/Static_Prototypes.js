/**
 * @author Johannes Lindén / http://solidcloud.se/
 */

if(Vector){
	Vector.set = function(v, x, y, z) {
		if (arguments.length === 2) {
			v.x=x.x || x[0];
			v.y=x.y || x[1];
			v.z=x.z || x[2];
		} 
		else {
			v.x = x;
			v.y = y;
			v.z = z;
		}
	};
	Vector.get = function(v) {
		return new Vector(v.x, v.y, v.z);
	};
	Vector.mag = function(v) {
		return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
	};
	Vector.add = function(v1, v2, y, z) {
		if (typeof v1 == "object" && typeof v2 == "object") 
			return new Vector( v1.x + v2.x, v1.y + v2.y, v1.z + v2.z );

		if (typeof v1 == "object" && arguments.length == 2 ) 
			return new Vector(v1.x + v2, v1.y + v2, v1.z + v2);
			
		return new Vector(v1.x + v2, v1.y + y, v1.z + z);
	};
	Vector.sub = function(v1, v2, y, z) {
		if (typeof v1 == "object" && typeof v2 == "object") 
			return new Vector( v1.x - v2.x, v1.y - v2.y, v1.z - v2.z );

		if (typeof v1 == "object" && arguments.length == 2 ) 
			return new Vector(v1.x - v2, v1.y - v2, v1.z - v2);
			
		return new Vector(v1.x - v2, v1.y - y, v1.z - z);
	};
	Vector.dot=function(v,w){
		return (w.x*v.x + w.y*v.y + w.z*v.z);
	};
	Vector.mult= function(v,w) {
		var e=new Vector(v.x,v.y,v.z);
		if(typeof w === 'number') {
			e.x *= w;
			e.y *= w;
			e.z *= w;
		}
		else if( w instanceof Vector) {
			e.x *= w.x;
			e.y *= w.y;
			e.z *= w.z;
		}
		return e;
	};
	Vector.div = function(a, v) {
		if (typeof v === 'number') {
			return new Vector(a.x/v,a.y/v,a.z/v);
		} 
		else if (typeof v === 'object') {
			return new Vector(a.x/v.x, a.y/v.y, a.z/v.z);
		}
	};
	Vector.dist = function(a, v) {
		var dx = a.x - v.x,
			dy = a.y - v.y,
			dz = a.z - v.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	};
	Vector.cross = function(a, v) {
		return new Vector(a.y * v.z - v.y * a.z,
						  a.z * v.x - v.z * a.x,
						  a.x * v.y - v.x * a.y);
	};
	Vector.normalize = function(v) {
		var m = v.mag();
		if (m > 0) {
			return Vector.div(v,m);
		}
	};
	Vector.limit = function(a, high) {
		if (a.mag() > high) {
			a.normalize();
			a.mult(high);
		}
	};
	Vector.distance = function(v1,v2){
		return Math.sqrt(
			(v1.x-v2.x)*(v1.x-v2.x) +
			(v1.y-v2.y)*(v1.y-v2.y) +
			(v1.z-v2.z)*(v1.z-v2.z)
		);
	};
	Vector.heading2D = function(a) {
		return (-Math.atan2(-a.y, a.x));
	};
	Vector.array = function(a) {
		return [a.x, a.y, a.z];
	};
	Vector.Farray = function(a){
		return new Vector(a[0],a[1],a[2]);
	}
}
if(Quaternion){
	Quaternion.conj=function(a, q){
		return q.mult(a).mult(q.inverse());
	};
	Quaternion.actOn=function(a,v){
		var V= new Quaternion(0.0,v);
		var R = V.conj(a);
		return R.u;
	};
}