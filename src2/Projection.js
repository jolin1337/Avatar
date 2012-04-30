importScripts('../src2/worker_Classes.js');
importScripts('../src2/Static_Prototypes.js');
var scene=new Scene();
var camera=new Camera();
self.addEventListener('message',function(e){
	if(e.data['first']){	//första gången
		var a=e.data.first.scene.objects;
		for(var i=a.length;i>0;i--){
			scene.objects.push(a[i-1]);
		}
		var a=e.data.first.scene.lights;
		for(var i=a.length;i>0;i--){
			scene.lights.push(a[i-1]);
		}
		scene.selected=e.data.first.scene.selected;
		scene.show=e.data.first.scene.show;
		
		a=e.data.first.camera;
		camera.position=Vector.Farray(a.position);
		camera.rotation=Vector.Farray(a.rotation);
		camera.scale=Vector.Farray(a.scale);
		camera.lens=a.lens;
		camera.width=a.width;
		camera.height=a.height;
		camera.quaternion.x=a.quaternion[0];
		camera.quaternion.u=Vector.Farray(a.quaternion[1]);
		
		
		self.postMessage(self.projection(scene,camera));
	}
	else if(e.data['quaternion']){
		camera.quaternion.x=e.data.quaternion[0];
		camera.quaternion.u=Vector.Farray(e.data.quaternion[1]);
		
		
		self.postMessage(self.projection(scene,camera));
	}
});
function getPolygons(obj,vert){
	function getFace(i,vert){
		var ans=[];
	}
	var ans=[];
	for(var i=0;i<6;i++){
		ans[i] = [];
		for(var j=0;j<4;j++){
			if(!vert)
				var v=obj.vertices[obj,faces[i][j]];
			else
				var v=vert[obj.faces[i][j]];
			ans[i][j]=new Vector(v.x,v.y,v.z);
		}
	}
	return ans;
}
self.projection=function(s,c,w){
	var f=new Vector(0,0,w||600),v=new Vector(1,1,1);
	function slowSortByDist(cubes, u){
		var ans=cubes;
		var L = ans.length;
		for (var i=0;i<L-1;i++) {
			for (var j=i+1;j<L;j++){
				if (ans[j].center.dot(u) < ans[i].center.dot(u)){
					var c = ans[i];
					ans[i] = ans[j];
					ans[j] = c;  
					ans[i]=ans[i];
				}
			}
		}
		return ans;
	}
	function project (v,f){
		//referenser
		//http://en.wikipedia.org/wiki/3D_projection
		//http://www.devmaster.net/articles/software-rendering/part1.php
		var x, y, z;
		x=f.x+(v.x-f.x)*f.z/(f.z-v.z);
		y=f.y+(v.y-f.y)*f.z/(f.z-v.z);
		z=v.dot(f);/*
		x=v.x*f.z/(f.z-v.z);
		y=v.y*f.z/(f.z-v.z);*/
		return new Vector( x, y, z ); 
	}
	function projectPolygons(P, f,s){
		var ans = [],f=f;
		for (var i=0; i<P.length; i++){
			ans[i] = []; 
			for (var j=0; j<P[i].length; j++ ){
				ans[i][j] = project(P[i][j],f);   
				ans[i][j].mult(s);
			}  
		}
		ans.sort(function(a,b){
			var a1=0,b1=0;
			for(var i=0;i<a.length;i++){
				a1+=a[i].dot(f);
			}
			for(var i=0;i<a.length;i++){
				b1+=b[i].dot(f);
			}
			return a1-b1;
		});
		return ans;
	}
	
	var all=s.objects,o=all.length;
	var projekt=[];
	var color=[];
	c.position = c.quaternion.actOn(c.quaternion, c.position);
	for(var b=o,i=0;b>i;i++){
		var object=all[i],vert=[];
		for(var j=0;j<object.vertices.length;j++)
			vert[j] = c.quaternion.actOn(object.vertices[j]);
		object.center = c.quaternion.actOn(object.center);//b&&alert(q.u,this.center);
		projekt.push(projectPolygons(getPolygons(object,vert),f,c.scale));
		color.push({color:object.fillCol});
	}
	var L=projekt.length;
	for(var i=0;i<L;i++){
		for(var j=0;j<L;j++){
			for(var k=0;k<6;k++){
				projekt[i][k][0]={
					x:projekt[i][k][0].x,
					y:projekt[i][k][0].y,
					z:projekt[i][k][0].z,
				};
				projekt[i][k][1]={
					x:projekt[i][k][1].x,
					y:projekt[i][k][1].y,
					z:projekt[i][k][1].z,
				};
				projekt[i][k][2]={
					x:projekt[i][k][2].x,
					y:projekt[i][k][2].y,
					z:projekt[i][k][2].z,
				};
				projekt[i][k][3]={
					x:projekt[i][k][3].x,
					y:projekt[i][k][3].y,
					z:projekt[i][k][3].z,
				};
					//[2] = .z
				var c1=(projekt[i][k][0][2]+projekt[i][k][1][2]+projekt[i][k][2][2]+projekt[i][k][3][2])/4;
				var c2=(projekt[j][k][0][2]+projekt[j][k][1][2]+projekt[j][k][2][2]+projekt[j][k][3][2])/4;
			}
			if(c1<c2){
				var c=projekt[i];
				projekt[i] = projekt[j];
				projekt[j]=c;
				projekt[i]=projekt[i];
				var d=color[i];
				color[i] = color[j];
				color[j] = d;
				color[i] = color[i];
				color[i].z=c2;
				color[j].z=c1;
			}
		}
	}
//	projekt=slowSortByDist(projekt,f);
	return [projekt,color];
};