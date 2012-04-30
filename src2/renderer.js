
var Scene=function(){
	this.objects=[];
	this.lights=[];
	this.selected=0;
	this.cursor = new Vertex(0,0,150);
	this.SpaceView3D=SpaceView3D || {};
	/*{
		grid:true,
		xAxis:true,
		yAxis:true,
		zAxis:false,
		render:false,
		cursor:true
	};*/
	this.addObject=function(a){
		this.objects.push(a);
	};
	this.removeObject=function(b){
		if(typeof b === 'object')
			for( var i=0;i<this.objects.length;i++)
				if(this.objects[i].id == b.id)
					return this.objects.splice(i,1);
		else
			return this.objects.splice(b,1);
	};
	this.removeObjectFromId=function(b){
		for( var i=0;i<this.objects.length;i++)
			if(this.objects[i].id === b)
				this.objects.splice(i,1);
	}
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
	this.getObject=function(id){
		for(var i in this.objects)
			if(this.objects[i].id == id)
				return this.objects[i];
	};
};
var Camera=function(pos,rot){
	this.position	= new Vector(0,0,500);
	this.rotation	= new Vector(0,0,0);
	this.scale		= new Vector(1,1,1);
	this.lens		= 45;
	this.width		= "auto";
	this.height		= "auto";
	this.quaternion	= new Quaternion(-90,new Vector(-45,45/2,-45));
	//this.quaternion	= new Quaternion(0,new Vector(0,0,0));
};
var Rendering=function(){
	var state = true;		// intersection doing one time calc(not implemented var)
	var f=new Vector(0,0,10),v=new Vector(1,1,1);
	//var view3D = view3D || {};
	var scope = this,
		xMat = new Material(160,0,0),
		yMat = new Material(0,160,0),
		zMat = new Material(0,0,160),
		defaultMat = new Material(12,12,12);
	scope.objects={};
	var grid = new (function(){
		this.position=new Vector();
		this.fillCol=new color(0,0,0);
		this.strokeCol=this.fillCol;
		this.id="Grid";
		this.Faces=[];
		this.constructor=new Object3D;
	})();
	if(grid!=null){
		var steps = 12, lengthOfSteps = 50;
		var length = steps*lengthOfSteps;
		var f2 = new Face( new Vertex(-length/2,0,0), new Vertex(length/2,0,0) );
		var f1 = new Face( new Vertex(0,-length/2,0), new Vertex(0,length/2,0) );
		var f3 = new Face( new Vertex(0,0,-length/2), new Vertex(0,0,length/2) );
		f2.material = yMat;
		f1.material = xMat;
		f3.material = zMat;
		grid.Faces.push(f2);
		grid.Faces.push(f1);
		grid.Faces.push(f3);
		for(var i = -length/2;i<=length/2;i+=lengthOfSteps){
			if(i != 0){
				f1 = new Face( new Vertex(i,-length/2,0), new Vertex(i,length/2,0) );
				f2 = new Face( new Vertex(-length/2,i,0), new Vertex(length/2,i,0) );
				f1.material = defaultMat;
				f2.material = defaultMat;
				grid.Faces.push(f1);
				grid.Faces.push(f2);
			}
		}
	}

	function projectPolygons(P, f,s,l,obj){
		if(P instanceof Array){
			var ans = [],light=[],f=f
				,rec=[];
			for (var i=0; i<P.length; i++){
				if(P[i] instanceof Array){
					ans[i] = new Face(); 
					ans[i].acitve = P[i].acitve;
					for (var j=0; j<P[i].length; j++ ){
						ans[i][j] = scope.project(P[i][j],f);   
						ans[i][j].mult(s);
					}  
				}
				else if(P[i] instanceof Face){
					ans[i] = new Face(); 
					ans[i].acitve = P[i].acitve;

					var vn=Vector.normalize(l[0].position);
					if(P[i].normal){
						ans[i].light=P[i].normal.position.dot(vn)*l[0].intensity;
						ans[i].color=P[i].color.clone().multiply(ans[i].light).toStyle();//object.fillCol.clone().multiply(projekt[i][k].light).toStyle()
					}
					if(ThemeView3D.drawNormals == true&&P[i].normal){
						if(view3D && view3D.ii)
							ans[i].normal = scope.project(P[i].normal.position,f);
						else ans[i].normal = P[i].normal.position;
						ans[i].normal.mult(ThemeView3D.normalLength);
					}

					if(view3D && view3D.ii)
						ans[i].position=scope.project(P[i].position,f).mult(1);
					else
						ans[i].position=P[i].position.mult(1);
					for (var j=0; j<P[i].vertices.length; j++){
						ans[i].vertices.push(new Vertex(P[i].vertices[j].position));
						if(view3D.ii)
							ans[i].vertices[j].screen = scope.project(P[i].vertices[j].worldPosition,f);   
						else
							ans[i].vertices[j].screen = P[i].vertices[j].worldPosition;

						ans[i].vertices[j].screen.mult(s);
						ans[i].vertices[j].activeVertex = P[i].vertices[j].activeVertex;
					}
				}
				else if(P[i] instanceof VertexC){
					ans[i] = new VertexC(P[i]);
					ans[i].activeHandle = P[i].activeHandle || false;
					ans[i].activeSpline=P[i].activeSpline || false;
					if(ThemeView3D.drawNormals == true&&P[i].normal){
						// TODO: Draw Narmals projektion
					}
					if( view3D.ii)
						ans[i].screen = scope.project(P[i].worldPosition,f).mult(1);
					else ans[i].screen = P[i].worldPosition;
					for(var j=0;j<P[i].handles.length;j++){
						if(view3D.ii)
							ans[i].handles[j].screen=scope.project(P[i].handles[j].worldPosition,f);
						else
							ans[i].handles[j].screen=P[i].handles[j].worldPosition;
							ans[i].handles[j].screen.mult(s);
					}
					ans[i].screen.mult(s);
				}
			}
			ans.sort(function(a,b){
				var a1=0,b1=0,r=0;
				if(a instanceof VertexC)return 1;
				else if(b instanceof VertexC)return -1;
				for(var i=0;i<a.vertices.length;i++){
					a1+=a.vertices[i].screen.z;
				}
				for(var i=0;i<b.vertices.length;i++){
					b1+=b.vertices[i].screen.z;
				}
				r=a1-b1;
				return r;
			});
			
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

	this.intersection=function(object,j,k) {
		function intersectFace(f1,f2,undefined){
			if(f1==undefined||f2==undefined)return false;
			//f1 => face f2 => line 
			if(!f1.normal||f1.normal==null||f1.normal==undefined)
				f1.normal=f1.calculateNormal();
			if(!f1.normal||f1.normal==null||f1.normal==undefined)return false;
			if(!f2.normal||f2.normal==null||f2.normal==undefined)
				f2.normal=f2.calculateNormal();
			if(!f2.normal||f2.normal==null||f2.normal==undefined)return false;

			function Side(p1,p2,a,b){
				cp1 = Vector.cross(Vector.sub(b,a),Vector.sub(p1,a));
				cp2 = Vector.cross(Vector.sub(b,a),Vector.sub(p2,a));
				if( cp1.dot(cp2) >= 0) return true;
				return false;
			}
			function intersectTriangle(p,a,b,c){
				if(Side(p,a,b,c) && Side(p,b,a,c) && Side(p,c,a,b))return true;
				return false;
			}

			ct2.clearRect(0,0,innerWidth,innerHeight);
			/*
			var a = P1(normal) dot P1(normal);
			var b = P1(normal) dot P2(normal);
			var c = P2(normal) dot P2(normal);
			var d = P1(normal) dot (P1.position sub P2.position);
			var e = P2(normal) dot (P1.position sub P2.position);

			var P1(intersection) = (b*e - c*d)/(a*c - b*b );
			var P2(intersection) = (a*e - b*d)/(a*c - b*b);

			if(P1(intersection) == P2(intersection))
				Lines are intersecting!
			*/
			ct2.strokeStyle="#f0f";
			var ans=[];
			var intersects=[];
			var Nf1=f1.normal.position.clone();
			var Nf2=f2.normal.position.clone();
			var w=Nf1.cross(Nf2);
			var f=f1.position.clone().add(Vector.dot(Nf1,f1.vertices[0].position));
			var v=camera.quaternion.actOn(w.mult(0));//.add(f));//.add(f1.position));//
			var v2=camera.quaternion.actOn(Nf2.cross(Nf1).mult(200));//.add(f2.position));//
			if(ct2){
				ct2.beginPath();
				ct2.moveTo(v2.x+innerWidth/2,v2.y+innerHeight/2);
				ct2.lineTo(v.x+innerWidth/2,v.y+innerHeight/2);
				ct2.closePath();
				ct2.stroke();

				ct2.strokeStyle="#0f0";
				v2 = camera.quaternion.actOn(f1.vertices[0].position.clone());
				v = camera.quaternion.actOn(f1.vertices[1].position.clone());
				ct2.beginPath();
				ct2.moveTo(v2.x+innerWidth/2,v2.y+innerHeight/2);
				ct2.lineTo(v.x+innerWidth/2,v.y+innerHeight/2);
				ct2.closePath();
				ct2.stroke();

				ct2.strokeStyle="#f00";
				var Nf1 = f1.normal.position.clone();
				var Nf2 = f2.normal.position.clone();
				var up = Vector.mult(f2.vertices[0].position.clone(), Nf1.clone());
				var next = Vector.sub( up, Vector.mult(f1.vertices[0].position.clone(), Nf2.clone()) );
				w = Vector.cross(Nf1.clone(), Nf2.clone());
				var fin = Vector.cross(next.clone(), w.clone());
				var d = Vector.mult(w.abs().clone(), w.abs().clone());
				var np = Vector.div(fin.clone(), w.abs().clone());
				var n = camera.quaternion.actOn(np);
				ct2.beginPath();
				ct2.moveTo(n.x+innerWidth/2, n.y+innerHeight/2);
				ct2.lineTo(innerWidth/2,innerHeight/2);
				ct2.closePath();
				ct2.stroke();
			}
			return;
			for(var i=0,k=Math.max(f1.vertices.length,f2.vertices.length);i<k;i++){
				var p0=f1.vertices[0].position.clone();
				var l0=f2.vertices[i].position.clone();
				var Vf2=f2.vertices;
				
				var pt=[Vf2[i].position,Vf2[(i+1<k?i+1:0)].position];

				//if(pt[1]===undefined)console.log(Vf2);
				var direction=Vector.sub(pt[0],pt[1]);
				direction.normalize();
				var b=direction.dot(Nf1);

				if( b ) {
					var dist=Vector.sub(p0,l0).dot(Nf1) / b;
					var point=Vector.mult(direction,dist).add(l0);
					//if(i==0)alert(point);

					var pr=scope.project(camera.quaternion.actOn(point),f);
					ct2.beginPath();
					ct2.moveTo(0,0);
					ct2.lineTo(pr.x+innerWidth/2,pr.y+innerHeight/2);
					ct2.closePath();
					ct2.strokeStyle="#f0f";
					ct2.stroke();
					if(f1.intersectTriangle(point)&&parseInt(f1.intersectPoint(pt[0]))&&parseInt(f1.intersectPoint(pt[1])) ) {
						//point.makeReal();
						//alert("Line: "+i+" intersects");
						intersects.push(i);
						//return point;
					}
					ans.push(point.makeReal());
					//var n_val=(Vector.mult(direction,dist).add(l0).sub(p0).dot(Nf1));
					//if(n_val)
						//console.log("N_Val:",n_val);
				}
				if(intersects.length)
					return [intersects,ans];
			}
		}
		if( SpaceView3D.debug )
			intersectFace(object.Faces[j],object.Faces[j+1]);
		else
			ct2.clearRect(0,0,innerWidth,innerHeight);
		return object;
		if(0&&(res=intersectFace(object.Faces[j],object.Faces[k]))&&res[1].length) {
			console.log(res[1]);
			var ans=1;
			if(object.Faces[j].vertices.length==2&&res[ans].length==1) {
				var temp=object.Faces[j].vertices[0].position;
				object.Faces[j].vertices[0].position=res[ans][0];
				object.Faces.push(
					new Face(new Vertex(temp),new Vertex(res[ans][0]))
				);
			}
			else if(res[ans].length==3){
				//var points=res[ans];
				var index=[];
				var res2=[],res1=[];
				for(var a=0;a<res[ans].length;a++){
					if(object.Faces[j].intersectPoint(res[ans][a])==0 && object.Faces[j].intersectTriangle(res[ans][a]))
						res2.push(res[ans][a]);
					else if(object.Faces[k].intersectPoint(res[ans][a])==0 && object.Faces[k].intersectTriangle(res[ans][a]))
						res1.push(res[ans][a]);
				}
				if(res1.length)
					res=res1,
					cur=object.Faces[j];
				else if(res2.length)
					res=res2,
					cur=object.Faces[k];
				//alert(res);
				if(res.length>=2){
					var temp=cur.vertices[0].position;
					var temp2=cur.vertices[1].position;
					cur.vertices[0].position=res[0];
					cur.vertices[1].position=res[1];
					object.Faces.push(
						new Face(new Vertex(temp),new Vertex(res[1]),new Vertex(temp2))
					);
				}
			}
		}
		return object;
	}
	this.projection=function(s,c){
		if ( s.SpaceView3D.show_cursor === true && s.SpaceView3D.cursor_location instanceof Vertex ) {
			s.SpaceView3D.cursor_location.worldPosition = c.quaternion.actOn( s.SpaceView3D.cursor_location.position );
			if( view3D.ii )
				s.SpaceView3D.cursor_location.screen = scope.project( s.SpaceView3D.cursor_location.worldPosition, f );
			else
				s.SpaceView3D.cursor_location.screen = s.SpaceView3D.cursor_location.worldPosition;
		}

		var all=s.objects,o=all.length;
		var projekt=[];
		var COLOR=[];
		var newO=[];

		for(var i=0;i<o;i++){			//loop objects
			var object=all[i],vert=[];
			if( object.constructor instanceof Object3D){
				for(var j=0;j<object.Faces.length;j++){
					if(object.Faces[j] instanceof Face){
						vert[j]=new Face();
						vert[j].acitve=object.activeObject || false;
						vert[j].activeFace = object.Faces[j].activeFace || false;
						vert[j].color=object.Faces[j].material || object.fillCol;

						object = scope.intersection(object,j,k);
						for(var k=object.Faces[j].vertices.length,k2=0;k2<k;k2++){
							var ver = new Vertex(object.Faces[j].vertices[k2].position.clone());
							ver.worldPosition=c.quaternion.actOn(ver.position.add(object.position));
							ver.position=c.quaternion.actOn(ver.position);
							ver.activeVertex = object.Faces[j].vertices[k2].activeVertex;

							vert[j].vertices.push(ver);
						}
						if(object.Faces[j].vertices.length>=3)
							vert[j].normal=vert[j].calculateNormal();
						vert[j].position=vert[j].calculatePosition();

						if(vert[j].normal){
							var vn=Vector.normalize(s.lights[0].position);

							// ### CALCULATE LIGHTING-COLOR OF FACE ###
							if( !(vert[j].color.image && vert[j].color.image.complete) ) {
								if(view3D.ii)
									vert[j].light = scope.project(vert[j].normal.position,f).dot(scope.project(vn,f)) * s.lights[0].intensity;
								else
									vert[j].light = vert[j].normal.position.dot(vn,f) * s.lights[0].intensity;
								vert[j].color = vert[j].color.clone().multiply(vert[j].light).toStyle();
							}
							else if( !vert[j].color.image.complete )
								vert[j].color = "#ff0000";
							else
								vert[j].color = vert[j].color.toStyle();
							// ### CALCULATE THE NORMALS IF THEY WILL BE SHOWN ###
							if( ThemeView3D.drawNormals == true ){
								if(view3D && view3D.ii)
									vert[j].normal = scope.project(vert[j].normal.position,f);
								else vert[j].normal = vert[j].normal.position;
								vert[j].normal.mult(ThemeView3D.normalLength);
							}
						}
						else
							vert[j].color = vert[j].color.toStyle();

						if(view3D && view3D.ii)
							vert[j].position=scope.project(vert[j].position,f).mult(1);
						else
							vert[j].position=vert[j].position.mult(1);
						for (var k=0; k<vert[j].vertices.length; k++){
							//vert[j].vertices.push(new Vertex(vert[j].vertices[k].position));
							if(view3D.ii)
								vert[j].vertices[k].screen = scope.project(vert[j].vertices[k].worldPosition,f);   
							else
								vert[j].vertices[k].screen = vert[j].vertices[k].worldPosition;

							vert[j].vertices[k].screen.mult(c.scale);
							vert[j].vertices[k].activeVertex = vert[j].vertices[k].activeVertex;
						}
					}
				}
			}
			else if ( object.constructor instanceof Curve3D ) {
				//object = this.intersection(object,j,k);
				for(var j=0;j<object.Faces.length;j++){
					vert[j] = new VertexC(object.Faces[j]);
					vert[j].active=object.activeObject || false;
					vert[j].activeSpline=object.Faces[j].activeSpline||false;
					vert[j].worldPosition=c.quaternion.actOn(vert[j].position);
					
					if( view3D.ii)
						vert[j].screen = scope.project(vert[j].worldPosition,f).mult(1);
					else vert[j].screen = vert[j].worldPosition;
					for(var k=0;k<vert[j].handles.length;k++){
						vert[j].handles[k].worldPosition = c.quaternion.actOn(vert[j].handles[k].position);
						
						if(ThemeView3D.drawNormals == true&&vert[j].normal){
							// TODO: Draw Narmals projektion
						}

						if(view3D.ii)
							vert[j].handles[k].screen = scope.project(vert[j].handles[k].worldPosition,f);
						else
							vert[j].handles[k].screen = vert[j].handles[k].worldPosition;
						vert[j].handles[k].screen.mult(c.scale);
					}
					vert[j].screen.mult(c.scale);
				}
			}
			var posI = 0;
			vert.sort(function(a,b){
				var a1=0,b1=0,r=0;
				if(a instanceof VertexC)return 1;
				if(b instanceof VertexC)return -1;
				/*for(var i=0;i<a.vertices.length;i++){
					a1+=a.vertices[i].screen.z;
				}
				for(var i=0;i<b.vertices.length;i++){
					b1+=b.vertices[i].screen.z;
				}
				r=a1-b1;*/
				posI += a.position.z;
				return a.position.z - b.position.z;
			});
			posI /= vert.length;
			//var b=projectPolygons(vert,f,c.scale,s.lights,newO[i]);
			projekt.push(vert);
			COLOR.push({i:0,COLOR:object.fillCol});
			for(var j=1;j<=i;j++){		//loop 
				try{
					var posJ = 0;
					projekt[j].map(function (a) {
						posJ += a.position.z;
					});
					posJ /= projekt[j].length;
					if( posJ > posI ){
							//THE PROJEKT ARRAY
						var C=projekt[i];
						projekt[i] = projekt[j];
						projekt[j] = C;
						projekt[i] = projekt[i];
							//THE COLOR
						var d=COLOR[i];
						COLOR[i] = COLOR[j];
						COLOR[j] = d;
						COLOR[i] = COLOR[i];
						COLOR[i].z=all[i].position.dot(f);
						COLOR[j].z=all[j].position.dot(f);
					}
				}
				catch(e){
					// no vertices
					if(e.name!="TypeError")
						console.log(e);
				}
			}
		}
		state = false;
		return [projekt,COLOR];
	};
	this.render=function(scene,camera,params,undefined){
		var mode=null;
		if(params!=undefined)
			mode = params.mode;
		f.z=camera.lens*10;
		function drawDots(P,k){
			var w=ThemeView3D.vertexSize;
			var length=new Vector(innerWidth/2,innerHeight/2);
			context.fillStyle=ThemeView3D.vertex;
			for(var j=0;j<P[k].vertices.length;j++){
				if(P[k].vertices[j].activeVertex)
					context.fillStyle = ThemeView3D.vertexSelect;
				else
					context.fillStyle = ThemeView3D.vertex;
				if((P[k].vertices[j].screen.x+length.x>=-innerWidth/2&&P[k].vertices[j].screen.x-length.x<=innerWidth/2&&
						P[k].vertices[j].screen.y+length.y>=-innerHeight/2&&P[k].vertices[j].screen.y-length.y<=innerHeight/2))
					context.fillRect(P[k].vertices[j].screen.x-w/2,P[k].vertices[j].screen.y-w/2,w , w );
			}
		}
		function drawNormals(P,k){
			context.strokeStyle=ThemeView3D.faceNormal;
			var ofX=0,ofY=0;
			context.beginPath();
			context.moveTo(P[k].position.x,P[k].position.y);
			context.lineTo(P[k].normal.x+P[k].position.x,P[k].normal.y+P[k].position.y);
			context.closePath();
			context.stroke();
		}
		function texturePath( x0, y0, x1, y1, x2, y2, bitmap, u0, v0, u1, v1, u2, v2 ) {

			// http://extremelysatisfactorytotalitarianism.com/blog/?p=2120

			var a, b, c, d, e, f, det,
			width = bitmap.width - 1,
			height = bitmap.height - 1;

			u0 *= width; v0 *= height;
			u1 *= width; v1 *= height;
			u2 *= width; v2 *= height;

			x1 -= x0; y1 -= y0;
			x2 -= x0; y2 -= y0;

			u1 -= u0; v1 -= v0;
			u2 -= u0; v2 -= v0;

			det = 1 / ( u1 * v2 - u2 * v1 ),

			a = ( v2 * x1 - v1 * x2 ) * det,
			b = ( v2 * y1 - v1 * y2 ) * det,
			c = ( u1 * x2 - u2 * x1 ) * det,
			d = ( u1 * y2 - u2 * y1 ) * det,

			e = x0 - a * u0 - c * v0,
			f = y0 - b * u0 - d * v0;

			context.save();
			context.transform( a, b, c, d, e, f );
			context.clip();
			context.drawImage( bitmap, 0, 0 );
			context.restore();

		}
		function paintPolygons(P,k){
			var length=new Vector(innerWidth/2,innerHeight/2);
			//var boundings=P[k].vertices[0].screen.x+length.x>=-innerWidth/2&&P[k].vertices[0].screen.x-length.x<=innerWidth/2&&
			//			P[k].vertices[0].screen.y+length.y>=-innerHeight/2&&P[k].vertices[0].screen.y-length.y<=innerHeight/2;
			//if(boundings)
			if( P[k].color.image && P[k].color.image.complete ) {
				
				var faceSelected = P[k]["activeFace"] || 0;
				var edgeSelected = faceSelected || 0;
				context.beginPath();
				context.moveTo(P[k].vertices[0].screen.x, P[k].vertices[0].screen.y);
				for(var j=0;j<P[k].vertices.length;j++){
					if( faceSelected !== false && P[k].vertices[j].activeVertex )
						faceSelected++;
					if( edgeSelected !== false && P[k].vertices[j].activeVertex )
						edgeSelected++;
					context.lineTo(P[k].vertices[j].screen.x, P[k].vertices[j].screen.y);
				}
				context.closePath();

				if(P[k].vertices.length >= 4){
					texturePath(
						P[k].vertices[3].screen.x, P[k].vertices[3].screen.y,
						P[k].vertices[2].screen.x, P[k].vertices[2].screen.y,
						P[k].vertices[0].screen.x, P[k].vertices[0].screen.y,
						P[k].color.image, 0, 0, 1, 0, 0, 1);
					texturePath(
						P[k].vertices[1].screen.x, P[k].vertices[1].screen.y,
						P[k].vertices[2].screen.x, P[k].vertices[2].screen.y,
						P[k].vertices[0].screen.x, P[k].vertices[0].screen.y,
						P[k].color.image, 0, 0, 1, 0, 0, 1);
					context.globalAlpha = 0.8;
					context.fillStyle= P[k].color.toStyle();
					context.fill();
					context.globalAlpha = 1;
				}
			}
			else {
				context.beginPath();
				context.moveTo(P[k].vertices[0].screen.x, P[k].vertices[0].screen.y);
				var faceSelected = P[k]["activeFace"] || 0;
				var edgeSelected = faceSelected || 0;
				for(var j=0;j<P[k].vertices.length;j++){
					if( faceSelected !== false && P[k].vertices[j].activeVertex )
						faceSelected++;
					if( edgeSelected !== false && P[k].vertices[j].activeVertex )
						edgeSelected++;
					context.lineTo(P[k].vertices[j].screen.x, P[k].vertices[j].screen.y);
				}

				context.closePath();
			}
			return [faceSelected, edgeSelected];
		}
		function drawHandle(P,k){

			context.strokeStyle=ThemeView3D.activeSpline;
			context.lineWidth=2;

			// ## Draw first handle ###
			context.beginPath();
			context.moveTo(
				P[k].screen.x+P[k].handles[0].screen.x,
				P[k].screen.y+P[k].handles[0].screen.y
			);
			context.lineTo(
				P[k].screen.x,
				P[k].screen.y
			);
			if( P[k].handles[0].activeSpline || P[k].activeSpline ) {
				context.stroke();
				context.strokeStyle="rgba(255,255,255,0.4)";
				context.lineWidth=1;
				context.stroke();
			}
			else
				context.stroke();
			
			context.closePath();

			context.lineWidth=2;
			context.strokeStyle=ThemeView3D.activeSpline;
			// ## Draw secound handle ###
			context.beginPath();
			context.moveTo(
				P[k].screen.x,
				P[k].screen.y
			);
			context.lineTo(
				P[k].screen.x+P[k].handles[1].screen.x,
				P[k].screen.y+P[k].handles[1].screen.y
			);

			if( P[k].handles[1].activeSpline || P[k].activeSpline ) {
				context.lineWidth=2;
				context.stroke();
				context.strokeStyle="rgba(255,255,255,0.4)";
				context.lineWidth=1;
				context.stroke();
			}
			else
				context.stroke();

			context.closePath();

			context.lineWidth=1;
		}
		function drawHandleDots( P, k){
			context.beginPath();
			context.fillRect(
				P[k].screen.x+P[k].handles[0].screen.x-ThemeView3D.vertexSize/2,
				P[k].screen.y+P[k].handles[0].screen.y-ThemeView3D.vertexSize/2,
				ThemeView3D.vertexSize,ThemeView3D.vertexSize
			);
			context.fillRect(
				P[k].screen.x+P[k].handles[1].screen.x-ThemeView3D.vertexSize/2,
				P[k].screen.y+P[k].handles[1].screen.y-ThemeView3D.vertexSize/2,
				ThemeView3D.vertexSize,ThemeView3D.vertexSize
			);
			context.closePath();
			context.stroke();
		}
		function drawCurveBody( P, k){
			context.beginPath();
			context.moveTo(P[k-1].screen.x, P[k-1].screen.y);
			context.bezierCurveTo(
				P[k-1].screen.x+P[k-1].handles[1].screen.x,	//ctrl 1
				P[k-1].screen.y+P[k-1].handles[1].screen.y,
				P[k].screen.x+P[k].handles[0].screen.x,		//ctrl 2
				P[k].screen.y+P[k].handles[0].screen.y,
				P[k].screen.x,P[k].screen.y					//end point
			);
			context.moveTo(P[k-1].screen.x,P[k-1].screen.y);
			context.closePath();
		}
		scene.SpaceView3D = scene.SpaceView3D || {};
		var show_floor =  grid != null && scene.SpaceView3D.show_floor;
		if( grid != null && show_floor ){
			if( scene.SpaceView3D.show_axis_x )
				grid.Faces[0].material = xMat;
			else grid.Faces[0].material = defaultMat;
			if( scene.SpaceView3D.show_axis_y )
				grid.Faces[1].material = yMat;
			else grid.Faces[1].material = defaultMat;
			if( scene.SpaceView3D.show_axis_z )
				grid.Faces[2].material.a = 1;
			else grid.Faces[2].material.a = 0;
			scene.addObject(grid);
		}
		var proj=this.projection(scene,camera);
		for(var b=proj[0].length,i=0;i<b;i++){
			var p=proj[1][i].color;	//color mesh
			var P=proj[0][i],		//Faces
				L=scene.lights[0];	//lights
			if (context && P.length){
				if( P[0].vertices && P[0].vertices.length > 0 ) {
					context.lineWidth = ThemeView3D.outlineWidth;
					for (var k=0;k<P.length;k++){
						if( !P[k].vertices || P[k] instanceof Face == false ) continue;
						/** ### INIT COLORS ### **/
						context.strokeStyle=ThemeView3D.wire||"#ccc";
						context.fillStyle="rgba(255,255,255,1)";
						if(!(P[k].color.image && P[k].color.image.complete ) ) 
							context.fillStyle=P[k].vertices.length>2?P[k].color || "#ccc":"rgba(255,255,255,1)",
							context.strokeStyle=P[k].color;

						/** ### END INIT COLORS END ### **/

						if( mode == null ){

							/** ### DRAW BASE LINES ### **/
							paintPolygons( P, k );
							/** ### END DRAW BASE LINES END ### **/

							/** ### APPLY SOLID FACE ### **/
							if( scene.SpaceView3D == undefined || scene.SpaceView3D.viewport_shade == "solid" && !( P[k].color.image && P[k].color.image.complete ) )
								context.fill();
							/** ### END APPLY SOLID FACES END ### **/

							/** ### APPLY WIRE FACE ### **/
							if( scene.SpaceView3D.viewport_shade == "wire" || ( scene.SpaceView3D.mode == "editmode" && P[k].acitve ) )
								context.strokeStyle=ThemeView3D.wire;
							if(!(P[k].color.image && P[k].color.image.complete ) && P[k].vertices.length>2 ) 
								context.stroke();  
							/** ### END APPLY WIRE FACE END ### **/

							/** ### DRAW DOTS ### **/
							if( ( scene.SpaceView3D.mode == "editmode" && P[k].acitve ) )
								drawDots( P, k);
							/** ### END DRAW DOTS END ### **/

							/** ### DRAW NORMALS ### **/
							if( ThemeView3D.drawNormals === true && P[k].normal )
								drawNormals( P, k );
							/** ### END DRAW NORMALS END ### **/
						}
						else if( mode == "editmode"){

							/** ### DRAW BASE LINES ### **/
							var selections = paintPolygons( P, k );
							/** ### END DRAW BASE LINES END ### **/

							/** ### APPLY SOLID FACE ### **/
							if( scene.SpaceView3D == undefined || scene.SpaceView3D.viewport_shade == "solid" ){
								if(!(P[k].color.image && P[k].color.image.complete ))
									context.fillStyle=P[k].color || "#ccc";
								else context.fillStyle="#000";
								context.fill();
							}
							if( selections[0] == P[k].vertices.length && (scene.SpaceView3D == undefined || scene.SpaceView3D.viewport_shade == "solid" )){
								context.fillStyle = ThemeView3D.faceSelected;
								context.fill();
							}
							/** ### END APPLY SOLID FACES END ### **/

							/** ### APPLY WIRE FACE ### **/
							if( scene.SpaceView3D.viewport_shade == "wire" || ( mode == "editmode" && P[k].acitve ) )
								context.strokeStyle = ThemeView3D.wire;
							context.stroke();  

							if( selections[1] >= 1 ) {
								context.strokeStyle = ThemeView3D.edgeSelect;
								for(var j=0;j<P[k].vertices.length -1;j++){
									if( P[k].vertices[j].activeVertex && P[k].vertices[j + 1 ].activeVertex ){
										context.beginPath();
										context.moveTo(P[k].vertices[j].screen.x,P[k].vertices[j].screen.y);
										context.lineTo(P[k].vertices[j +1].screen.x,P[k].vertices[j +1].screen.y);
										context.closePath();
										context.stroke();
									}
									else if(P[k].vertices[j].activeVertex){
										context.beginPath();
										context.moveTo( P[k].vertices[j].screen.x, P[k].vertices[j].screen.y );
										context.lineTo( P[k].vertices[j +1].screen.x,P[k].vertices[j +1].screen.y );
										context.closePath();

										var l = P[k].vertices[j +1].position.dist(P[k].vertices[j].position);
										// Gradient!!
										var linear = context.createLinearGradient( P[k].vertices[j].screen.x, P[k].vertices[j].screen.y, P[k].vertices[j + 1].screen.x, P[k].vertices[j + 1].screen.y );
										linear.addColorStop( 0, ThemeView3D.edgeSelect );
										linear.addColorStop( 1, ThemeView3D.wire );
										context.strokeStyle = linear;

										context.stroke();
										context.strokeStyle = ThemeView3D.edgeSelect;
									}
									else if(P[k].vertices[j +1].activeVertex){
										context.beginPath();
										context.moveTo( P[k].vertices[j +1].screen.x, P[k].vertices[j +1].screen.y );
										context.lineTo(P[k].vertices[j].screen.x,P[k].vertices[j].screen.y);
										context.closePath();

										var l = P[k].vertices[j +1].position.dist(P[k].vertices[j].position);
										// Gradient!!
										var linear = context.createLinearGradient( P[k].vertices[j + 1].screen.x, P[k].vertices[j + 1].screen.y, P[k].vertices[j].screen.x, P[k].vertices[j].screen.y );
										linear.addColorStop( 0, ThemeView3D.edgeSelect );
										linear.addColorStop( 1, ThemeView3D.wire );
										context.strokeStyle = linear;

										context.stroke();
										context.strokeStyle = ThemeView3D.edgeSelect;
									}
								}
								if( P[k].vertices[0].activeVertex && P[k].vertices[ P[k].vertices.length-1 ].activeVertex ){
									context.beginPath();
									context.moveTo(P[k].vertices[0].screen.x,P[k].vertices[0].screen.y);
									context.lineTo(P[k].vertices[ P[k].vertices.length-1 ].screen.x,P[k].vertices[ P[k].vertices.length-1 ].screen.y);
									context.closePath();
									context.stroke();
								}
								else if(P[k].vertices[0].activeVertex){
									context.beginPath();
									context.moveTo( P[k].vertices[0].screen.x, P[k].vertices[0].screen.y );
									context.lineTo(P[k].vertices[ P[k].vertices.length-1 ].screen.x,P[k].vertices[ P[k].vertices.length-1 ].screen.y);
									context.closePath();
								
									var l = P[k].vertices[P[k].vertices.length-1].position.dist(P[k].vertices[P[k].vertices.length-1].position);
									// Gradient!!
									var linear = context.createLinearGradient( P[k].vertices[0].screen.x, P[k].vertices[0].screen.y, P[k].vertices[P[k].vertices.length-1].screen.x, P[k].vertices[P[k].vertices.length-1].screen.y );
									linear.addColorStop( 0, ThemeView3D.edgeSelect );
									linear.addColorStop( 1, ThemeView3D.wire );
									context.strokeStyle = linear;

									context.stroke();
									context.strokeStyle = ThemeView3D.edgeSelect;
								}
								else if( P[k].vertices[ P[k].vertices.length -1 ].activeVertex ){
									context.beginPath();
									context.moveTo(P[k].vertices[ P[k].vertices.length-1 ].screen.x,P[k].vertices[ P[k].vertices.length-1 ].screen.y);
									context.lineTo(P[k].vertices[0].screen.x,P[k].vertices[0].screen.y);
									context.closePath();

									var l = P[k].vertices[P[k].vertices.length-1].position.dist(P[k].vertices[P[k].vertices.length-1].position);
									// Gradient!!
									var linear = context.createLinearGradient( P[k].vertices[P[k].vertices.length-1].screen.x, P[k].vertices[P[k].vertices.length-1].screen.y, P[k].vertices[0].screen.x, P[k].vertices[0].screen.y );
									linear.addColorStop( 0, ThemeView3D.edgeSelect );
									linear.addColorStop( 1, ThemeView3D.wire );
									context.strokeStyle = linear;
									
									context.stroke();
									context.strokeStyle = ThemeView3D.edgeSelect;
								}
							}
							/** ### END APPLY WIRE FACE END ### **/

							/** ### DRAW DOTS ### **/
							if( ( P[k].acitve ) )
								drawDots( P, k);
							/** ### END DRAW DOTS END ### **/

							/** ### DRAW NORMALS ### **/
							if( ThemeView3D.drawNormals === true && P[k].normal )
								drawNormals( P, k );
							/** ### END DRAW NORMALS END ### **/

							if( context.fillStyleR )
								context.fillStyleR=false;
							if( context.strokeStyleR )
								context.strokeStyleR=false;
						}
						else if( mode == "dot-mode" ) 
							drawDots( P, k );
						else {
							if(mode != "objectmode")
								console.log( "THE MODE: "+mode+", IS NOT SUPPORTED!",
									"Drawing default mode (objecmode instead)" );

							/** ### DRAW BASE LINES ### **/
							paintPolygons( P, k );
							/** ### END DRAW BASE LINES END ### **/

							/** ### APPLY SOLID FACE ### **/
							if( scene.SpaceView3D == undefined || scene.SpaceView3D.viewport_shade == "solid" )
								context.fill();
							/** ### END APPLY SOLID FACES END ### **/

							/** ### APPLY WIRE FACE ### **/
							if( scene.SpaceView3D.viewport_shade == "wire" || ( scene.SpaceView3D.mode == "editmode" && P[k].acitve ) )
								context.strokeStyle=ThemeView3D.wire;
							context.stroke();  
							/** ### END APPLY WIRE FACE END ### **/

							/** ### DRAW DOTS ### **/
							if( ( scene.SpaceView3D.mode == "editmode" && P[k].acitve ) )
								drawDots( P, k);
							/** ### END DRAW DOTS END ### **/

							/** ### DRAW NORMALS ### **/
							if( ThemeView3D.drawNormals === true && P[k].normal )
								drawNormals( P, k );
							/** ### END DRAW NORMALS END ### **/
						}
						
					}
				}
				else if( P[0] instanceof VertexC ) {

					for(var k=1;k<P.length;k++){
						if( P[k-1] instanceof VertexC == false ) continue;
						context.fillStyle=ThemeView3D.vertex;

						var activeHandles = P[k-1].activeSpline && P[k].activeSpline || 
								( P[k -1].handles[0].activeSpline && P[k-1].handles[1].activeSpline && 
									P[k].handles[0].activeSpline && P[k].handles[1].activeSpline );

						if( mode == "editmode" ){
							context.strokeStyle=ThemeView3D.activeSpline;

							if(P[k-1] instanceof VertexC && k==1 && P[k-1].active){

								// ### DRAW HANDLE ###
								drawHandle( P, k-1 );

								// ### DRAW DOTS ###
								drawHandleDots( P, k-1 );
							}
							if(P[k].active) {
								// ### DRAW HANDLE ###
								drawHandle( P, k );

								// ### DRAW DOTS ###
								drawHandleDots( P, k );
							}
						}
						else {
						}
						if( P[i].active && ( mode != "editmode" || ( activeHandles ) ) )
							context.strokeStyle=ThemeView3D.activeObject;	
						else
							context.strokeStyle=ThemeView3D.wire;
						
						// ### PAINT BEIZERCURVE-LINE ###
						drawCurveBody( P, k);

						// ### STROKE ###
						context.stroke();

						/*else {
							if( P[i].active && mode!="objectmode" )
								context.strokeStyle=ThemeView3D.activeObject;
							else 
								context.strokeStyle=ThemeView3D.wire;
							context.beginPath();
							context.moveTo(P[k-1].screen.x, P[k-1].screen.y);
							context.bezierCurveTo(
								P[k-1].screen.x+P[k-1].handles[1].screen.x,//ctrl 1
								P[k-1].screen.y+P[k-1].handles[1].screen.y,
								P[k].screen.x+P[k].handles[0].screen.x,//ctrl 2
								P[k].screen.y+P[k].handles[0].screen.y,
								P[k].screen.x,P[k].screen.y//end point
							);
							context.moveTo(P[k-1].screen.x,P[k-1].screen.y);
							context.closePath();
							context.stroke();
							if( scene.SpaceView3D.mode == "editmode" ){
								context.strokeStyle=ThemeView3D.activeSpline;
								//context.beginPath();
								if(P[k-1] instanceof VertexC != false&&k==1&&P[k-1].active){

									drawHandle( P, k-1 );
									// dots
									drawHandleDots( P, k-1 );
								}
								if(P[k].active) {
									drawHandle( P, k );
									// dots
									drawHandleDots( P, k );
								}
							}
						}*/
					}
				}
				/** ### Draw Cursor ### **/
				if( scene.SpaceView3D && scene.SpaceView3D.show_cursor && scene.SpaceView3D.cursor_location instanceof Vertex ) {
					var w=25;
					if(scene.SpaceView3D.cursor.complete) {
						if( view3D.ii ) {
							context.drawImage( SpaceView3D.cursor,scene.SpaceView3D.cursor_location.worldPosition.x-w/2, scene.SpaceView3D.cursor_location.worldPosition.y-w/2, w, w  )
						}
						else
							context.drawImage( SpaceView3D.cursor,scene.SpaceView3D.cursor_location.worldPosition.x-w/2, scene.SpaceView3D.cursor_location.worldPosition.y-w/2, w, w  )
					}
				}
				/** ### END Draw Cursor ### **/
			}
		}

		if( show_floor ){
			scene.removeObject(scene.objects.length-1);
		}
	};
};
Rendering.prototype.projektRay = function(s,ray){
	ray.point1.screen = ray.point1.position.clone().mult(s);
	ray.point2.screen = ray.point2.position.clone().mult(s);
};

Rendering.prototype.pointInRay = function(ray, pointIn, proj, camera, LOCATION){
	if( ray.shape == "Circle" ) {
		if( proj != undefined && proj )
			this.projektRay( camera.quaternion, LOCATION );
		var sqdist1 = Math.pow(ray.point1.screen.x - pointIn.x, 2) + Math.pow(ray.point1.screen.y - pointIn.y, 2);
		var sqdist2 = Math.pow(ray.point2.screen.x - pointIn.x, 2) + Math.pow(ray.point2.screen.y - pointIn.y, 2);
		//console.log(sqdist, ray.radius*ray.radius);
		var sqr = ray.radius*ray.radius;
		return sqdist1 <= sqr || sqdist2 <= sqr;
	}
	else if( ray.shape == "Inifinity" ) {
		
	}
	else if( ray.shape == "Box") {
		
	}
	else if( ray.shape == "Face") {
		
	}
}

Rendering.prototype.selectRay = function(){
	if(arguments.length<2 || !(arguments[0] instanceof Ray) || !(arguments[1].scene || arguments[1].camera) ) return false;
	var selectSingle = arguments[1].single;
	var LOCATION = arguments[0];
	var scene = arguments[1].scene;
	var camera = arguments[1].camera;
	var undefined = arguments[2];

	this.projektRay( camera.scale, LOCATION );

	var all=(scene?scene.objects:arguments[1].objects),o=all.length;

	for(var i=0;i<o;i++) {
		var object = all[i];

		if(object.activeObject){
			var ans = [];
			var f=object.Faces.length;

			for(var j=0;j<f;j++){
				var face = object.Faces[j];

				if( face instanceof Face) {
					var v = face.vertices.length;
					for(var k=0;k<v;k++){
						var vertex = face.vertices[k];
						vertex.worldPosition = camera.quaternion.actOn( vertex.position );

						if( view3D.ii )
							vertex.screen = this.project( vertex.worldPosition, new Vector(0,0,500) );
						else
							vertex.screen = vertex.worldPosition.mult(camera.scale);
						if( this.pointInRay( LOCATION, vertex.screen ) ){
							if( selectSingle )
								return vertex;
							ans.push(i + "," + j + "," + k);
						}
					}
				}
				else if( face instanceof VertexC ) {
					face.worldPosition = camera.quaternion.actOn( face.position );

					if( view3D.ii )
						face.screen = this.project( face.worldPosition, new Vector(0,0,500) );
					else
						face.screen = face.worldPosition.mult(camera.scale);
					if( this.pointInRay( LOCATION, face.screen ) ){
						if( selectSingle )
							return face;
						ans.push(i + "," + j);
						continue;
					}

					var v = face.handles.length;
					for(var k=0;k<v;k++){
						var vertex = face.handles[k];
						vertex.worldPosition = camera.quaternion.actOn( vertex.position );

						if( view3D.ii )
							vertex.screen = this.project( vertex.worldPosition, new Vector(0,0,500) );
						else
							vertex.screen = vertex.worldPosition.mult(camera.scale);
						console.log(vertex.screen.data(), LOCATION.point1.screen.data());
						if( this.pointInRay( LOCATION, vertex.screen ) ){
							if( selectSingle )
								return vertex;
							ans.push(i + "," + j + "," + k);
						}
					}
				}
			}
			break;
		}
	}
	return ans;
};

Rendering.prototype.project= function(d,f){
	//referenser
	//http://en.wikipedia.org/wiki/3D_projection
	//http://www.devmaster.net/articles/software-rendering/part1.php
	var x, y, z;
	x=f.x+(d.x-f.x)*f.z/(f.z-d.z);
	y=f.y+(d.y-f.y)*f.z/(f.z-d.z);
	z=d.z;//d.dot(f);
	return new Vector( x, y, z ); 
}
Rendering.prototype.getSelected = function(s){
	var ans = [];
	for(var i in s.objects){
		if( s.objects[i].activeObject ){
			var f = s.objects[i].Faces;
			for( var j in f ) {
				var v = f[j].vertices;
				for( var k in v)
					if( v[k].activeVertex )
						ans.push(v[k]);
			}
		}
	}
	return ans;
}