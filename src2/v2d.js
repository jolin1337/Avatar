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
	return new Vector2d(this.x, this.y);
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