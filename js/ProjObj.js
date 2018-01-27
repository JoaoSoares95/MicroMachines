/*global THREE*/
'use strict'
/****************************************************************************************************
				Global variables and such
*****************************************************************************************************/
var amb;
//var camera=[];
var camera = [];
var active_camera = 0;
var scene, renderer;
var cheerios = [];
var mesh, geometry, material;

var keyUP=false, keyDOWN=false;
var stopUP=false, stopDOWN=false;
var clock = new THREE.Clock();
var alpha = 90;
var rotate=false;
var table;
var oranges = [];
var obj_colision = [];

var spotLightL, spotLightR;
var point_lights = [];
var dirLight;
var spot = true;

var table_text_list = [];
table_text_list[0] ='textures/wood-floor.jpg';
table_text_list[1] = 'textures/micro_blue.jpg'; 
table_text_list[2] ='textures/black_marble.jpg';
table_text_list[3] ='textures/grass.jpg';
table_text_list[4] ='textures/selfie.jpg';
table_text_list[5] ='textures/christmas.jpg';
table_text_list[6] ='textures/rickandmorty.jpg';

var ind = Math.round(Math.random()*6);
//table texture, pause texture and restart texture
var table_text = THREE.ImageUtils.loadTexture(table_text_list[ind]);
var start_text = THREE.ImageUtils.loadTexture('textures/chess.png');
var pause_text = THREE.ImageUtils.loadTexture('textures/pause.png');
var restart_text = THREE.ImageUtils.loadTexture('textures/restart.png');
var butter_text = THREE.ImageUtils.loadTexture('textures/butter.jpg');
var orange_text = THREE.ImageUtils.loadTexture('textures/orange.jpg');

table_text.wrapS = THREE.RepeatWrapping;
table_text.wrapT = THREE.RepeatWrapping;
table_text.repeat.set(1,1);
start_text.wrapS = THREE.RepeatWrapping;
start_text.wrapT = THREE.RepeatWrapping;
start_text.repeat.set(1,1);
pause_text.wrapS = THREE.RepeatWrapping;
pause_text.wrapT = THREE.RepeatWrapping;
pause_text.repeat.set(1,1);
restart_text.wrapS = THREE.RepeatWrapping;
restart_text.wrapT = THREE.RepeatWrapping;
restart_text.repeat.set(1,1);
butter_text.wrapS = THREE.RepeatWrapping;
butter_text.wrapT = THREE.RepeatWrapping;
butter_text.repeat.set(1,1);
orange_text.wrapS = THREE.RepeatWrapping;
orange_text.wrapT = THREE.RepeatWrapping;
orange_text.repeat.set(1,1);

var mode = 0, old_mode = 2;
var wireframe=true;

var carMat = [];
var cheerioMat = [];
var orangeMat = [];
var butterMat = [];
var tableMat = [];

var car;
var cars_lives = [];
var lives = 5;
var game_over = false;
var pause = false;
var pauseObj, restartObj;

carMat[0] = (new THREE.MeshPhongMaterial({color: 0xff4321, wireframe: true}));
carMat[1] = (new THREE.MeshLambertMaterial( {color: 0xff4321, wireframe: true }));
carMat[2] = (new THREE.MeshBasicMaterial( {color: 0xff4321, wireframe: true }));
cheerioMat[0] = (new THREE.MeshPhongMaterial({color: 0xffff00, wireframe: true}));
cheerioMat[1] = (new THREE.MeshLambertMaterial( {color: 0xffff00, wireframe: true }));
cheerioMat[2] = (new THREE.MeshBasicMaterial( {color: 0xffff00, wireframe: true }));
orangeMat[0] = (new THREE.MeshPhongMaterial({color: 0xff8c00, wireframe: true, shininess: 60, specular: 0xffffff, map: orange_text}));
orangeMat[1] = (new THREE.MeshLambertMaterial( {color: 0xff8c00, wireframe: true, map: orange_text}));
orangeMat[2] = (new THREE.MeshBasicMaterial( {color: 0xff8c00, wireframe: true, map: orange_text }));
butterMat[0] = (new THREE.MeshPhongMaterial({color: 0xffff00, wireframe: true, map: butter_text}));
butterMat[1] = (new THREE.MeshLambertMaterial( {color: 0xffff00, wireframe: true, map: butter_text }));
butterMat[2] = (new THREE.MeshBasicMaterial( {color: 0xffff00, wireframe: true, map: butter_text }));
tableMat[0] = (new THREE.MeshPhongMaterial({color: 0xffffff, wireframe: true, map: table_text}));
tableMat[1] = (new THREE.MeshLambertMaterial( {color: 0xffffff, wireframe: true, map: table_text}));
tableMat[2] = (new THREE.MeshBasicMaterial( {color: 0xffffff, wireframe: true, map: table_text}));

var objectsgroup = new THREE.Group();
/****************************************************************************************************
				Class creation and specification
*****************************************************************************************************/
//parent class to all others- usefull for handling objects atts and check for collisions
class Objects extends THREE.Object3D{
	constructor(){
		super();
		this.velocity = new THREE.Vector3();
		this.aceleration = new THREE.Vector3();
		this.maxvel = new THREE.Vector3();
		this.minvel = new THREE.Vector3();
		this.width = 0;
		this.height = 0;
		this.radius = 0;
		this.sentido = true;
		this.alpha = 0;
	}

	myType() { return "Objects"; }
	treatCollision(obj){}
	endTable(){}
	
	changeLightMaterial(materials, i) {
		this.change_Material(materials[i]);
		console.log(this);
	}
	
	change_Material(mat) {
		this.children[0].material = mat;
		this.children[0].material.wireframe = wireframe;
	}

	update_pos_table(delta){
		var old_vel = new THREE.Vector3().copy(this.velocity);
		var old_pos = new THREE.Vector3().copy(this.position);
		var new_vel = ((this.aceleration.multiplyScalar(delta)).add(old_vel)).clamp(this.minvel,this.maxvel);
		var new_pos = old_pos.add(new_vel);
		if (this.myType()=="Orange"){
			this.speed += delta; 
		}
		this.velocity.copy(new_vel);
		this.position.copy(new_pos);
	}

	checkCollisions(ob) {
        var ourPos = this.position;
        var objPos = ob.position;
        var dist = ourPos.distanceTo(objPos);
        //Considering a sphere around each object if sum of radiuses is less than distance between both centers, a collision is detected
        if(dist <= this.radius + ob.radius) {
            //Collision treatment is handled by the object
            this.treatCollision(ob);
        }
    }
}

//child class- car
class Car extends Objects{
	constructor(x,y,z){
		super();
		this.alpha = 0;
		this.maxvel.set(0,0,0);
		this.minvel.set(0,0,0);
		this.wireframe = false;
		this.aceleration.set(Math.sin(this.alpha), 0, Math.cos(this.alpha));
		this.width = 10;
		this.height = 3;
		//this.spotLightL;
		//this.spotLightR;
		createCar(this, x,y,z);
		this.radius = Math.sqrt(10.75);
	}

	updateMaterial(i){ this.changeLightMaterial(carMat, i);	}
	endTable(){ removeEntity(Car); }
	rotate_vel(dif){ this.alpha += dif;	}
	myType() { return "Car"; }

	moveUP(max,delta){
		this.minvel = new THREE.Vector3(-max * Math.cos((this.alpha)*Math.PI/180), 0, -max * Math.sin((this.alpha)*Math.PI/180));
		//this.maxvel = new THREE.Vector3(0, 0, 0);
		this.aceleration.set(-Math.cos(this.alpha*Math.PI/180), 0, -Math.sin(this.alpha*Math.PI/180));
		this.sentido = true;
		this.update_pos_table(delta);
		if ((this.position.x > 150) || (this.position.x < -150) || (this.position.z > 150) || (this.position.z < -150)){
			lives--;
			if (lives > 0){
				cars_lives[lives].visible = false;
			}
			else{
				pause = true;
			}
			
			this.position.set(105,2,120);
			this.alpha=0;
			//this.rotation.y=(-car.alpha)*(Math.PI/180);
			this.velocity.copy(new THREE.Vector3());
			rotate=true;
			alpha=0;
		}
	}

	moveDOWN(max,delta){
		//this.maxvel= new THREE.Vector3(0, 0, 0);
		this.minvel = new THREE.Vector3(max * Math.cos(this.alpha*Math.PI/180), 0, max * Math.sin(this.alpha*Math.PI/180));
		this.aceleration.set(Math.cos(this.alpha*Math.PI/180), 0, Math.sin(this.alpha*Math.PI/180));
		this.sentido=false;
		this.update_pos_table(delta);
		if ((this.position.x > 150) || (this.position.x < -150) || (this.position.z > 150) || (this.position.z < -150)){
			lives--;
			if (lives > 0){
				cars_lives[lives].visible = false;
			}
			else{
				pause = true;
			}
			this.position.set(105,2,120);
			this.alpha=0;
			//this.rotation.y=(-car.alpha)*(Math.PI/180);
			this.velocity.copy(new THREE.Vector3());
			rotate=true;
			alpha=0;
		}
	}
	
	treatCollision(ob){
		if(ob.myType()=="ButterStick"){
			if (this.sentido){
				this.moveDOWN(1, 0);
			}
			else {
				ob.velocity = new THREE.Vector3().copy(this.velocity.multiplyScalar(-1));
				this.moveUP(1, 0);
			}
		}
		else if(ob.myType()=="Orange"){
			lives--;
			if (lives > 0){
				cars_lives[lives].visible = false;
			}
			else{
				pause = true;
			}
			this.position.set(105,2,120);
			this.alpha=0;
			//this.rotation.y=(-car.alpha)*(Math.PI/180);
			this.moveUP(1,0);
			rotate=true;
			alpha=0;
		}

		else if(ob.myType()=="Cheerio"){ //DO Stuff
			if (this.sentido){
				ob.velocity = new THREE.Vector3().copy(this.velocity.multiplyScalar(2));
				ob.alpha = this.alpha;
				ob.moveUP(2, 2);
				this.moveDOWN(1, 1);
			}
			else {
				ob.velocity = new THREE.Vector3().copy(this.velocity.multiplyScalar(-1));
				ob.alpha = this.alpha;
				ob.moveDOWN(2, 2);
				this.moveUP(1, 1);
			}
		}
	}
}

//child class- orange
class Orange extends Objects{
	constructor(){
		super();
		this.speed = 1;
		this.velLevel = Math.random();
		//this.maxvel.set(1, 0, 0);
		this.width = 7;
		this.height = 5;
		createOrange(this, 134*Math.random()*2-134 ,7,134*Math.random()*2-134);
		//createOrange(this, 0,0,0);
		this.alpha = Math.random()*360;
		this.velocity.set(Math.cos(this.alpha), 0, Math.sin(this.alpha));
		this.minvel.set(Math.cos(this.alpha), 0, Math.sin(this.alpha));
		this.maxvel.set(Math.cos(this.alpha), 0, Math.sin(this.alpha));
		this.radius = 5;
	}

	myType() { return "Orange"; }
	updateMaterial(i){ this.changeLightMaterial(orangeMat, i); }

	renove_pos(){
		this.aceleration = new THREE.Vector3( Math.sin(this.alpha)/100, 0,  Math.cos(this.alpha)/100);
		this.velocity = new THREE.Vector3( Math.sin(this.alpha), 0,  Math.cos(this.alpha));
		//this.minvel = new THREE.Vector3(0,0,0);
		this.minvel = new THREE.Vector3(this.speed * Math.cos(this.alpha), 0, this.speed * Math.sin(this.alpha));
		this.speed	= Math.min(Math.max(parseInt(this.speed), 0), 0.5);
		this.maxvel = new THREE.Vector3(this.speed * Math.sin(this.alpha), 0, this.speed * Math.cos(this.alpha));
	}
}

//child class- butterStick
class ButterStick extends Objects{
	constructor(){
		super();
		this.maxvel.set(0, 0, 0);
		this.minvel.set(0, 0, 0);
		this.radius = Math.sqrt(49);
		createButterStick(this,140*Math.random()*2-140 ,7,140*Math.random()*2-140);
	}

	myType() { return "ButterStick"; }
	updateMaterial(i){ this.changeLightMaterial(butterMat, i); }
}

//child class- cheerio
class Cheerio extends Objects{
	constructor(x, y , z){
		super();
		this.maxvel.set(Math.sin(alpha), 0, Math.cos(alpha));
		this.width = 7;
		this.height = 5;
		this.radius = 1.5;
		this.maxvel.set(0, 0, 0);
		this.minvel.set(0, 0, 0);
		this.velocity.set(0, 0, 0);
		this.aceleration.set(0, 0, 0);
		this.positioninit = new THREE.Vector3(x,2.25,z);
		createCheerio(this, x, 2.25, z);
	}

	myType() { return "Cheerio"; }
	updateMaterial(i){ this.changeLightMaterial(cheerioMat, i);	}
	
	moveUP(max,delta){
		this.minvel = new THREE.Vector3(-max * Math.cos((this.alpha)*Math.PI/180), 0, -max * Math.sin((this.alpha)*Math.PI/180));
		this.maxvel = new THREE.Vector3(0, 0, 0);
		this.aceleration.set(-Math.cos(this.alpha*Math.PI/180), 0, -Math.sin(this.alpha*Math.PI/180));
		this.sentido = true;
		this.update_pos_table(delta);
	}

	moveDOWN(max,delta){
		this.maxvel= new THREE.Vector3(0, 0, 0);
		this.minvel = new THREE.Vector3(max * Math.cos(this.alpha*Math.PI/180), 0, max * Math.sin(this.alpha*Math.PI/180));
		this.aceleration.set(Math.cos(this.alpha*Math.PI/180), 0, Math.sin(this.alpha*Math.PI/180));
		this.sentido=false;
		this.update_pos_table(delta);
	}
	
	treatCollision(ob){
		if(ob.myType()=="ButterStick"){
			if (this.sentido==true){
				this.moveDOWN(1, 0);
			}
			else if (this.sentido==false){
				this.moveUP(1, 0);
			}
		}
		else if(ob.myType()=="Car"){
			if (ob.sentido){
				this.velocity = new THREE.Vector3().copy(ob.velocity.multiplyScalar(2));
				this.alpha = ob.alpha;
				this.moveUP(2, 2);
				ob.moveDOWN(1, 1);
			}
			else {
				this.velocity = new THREE.Vector3().copy(ob.velocity.multiplyScalar(-1));
				this.alpha = ob.alpha;
				this.moveDOWN(2, 2);
				ob.moveUP(1, 1);
			}
		}
		else if(ob.myType()=="Cheerio"){
			if (this.sentido){
				ob.velocity = new THREE.Vector3().copy(this.velocity);
				ob.alpha = this.alpha;
				ob.moveUP(1, 1);
				this.moveDOWN(1, 0);
			}
			else {
				ob.velocity = new THREE.Vector3().copy(this.velocity);
				ob.alpha = this.alpha;
				ob.moveDOWN(1, 1);
				this.moveUP(1, 0);
			}
		}
	}
}
/********************************************************************************************
					Functions to create the car
********************************************************************************************/
function createCar(car, x, y, z) {
	var meshes = [];
	var carMaterial = new THREE.MeshPhongMaterial( {color: 0xff4321, wireframe: true });
	addCube(meshes, carMaterial, .5,4,0, 5,4,3);
	addTejadilho(meshes, carMaterial, -.5, 6, -0.5);
	addCube(meshes, carMaterial, -2, 3, 0, 2, 2, 3);
	addTorus(meshes, carMaterial, 3,2.25,-2, .75,.5,10, 10);
	addTorus(meshes, carMaterial, 3,2.25,2, .75,.5,10, 10);
	addTorus(meshes, carMaterial, -1,2.25,-2, .75,.5,10,10);
	addTorus(meshes, carMaterial, -1,2.25,2, .75,.5,10,10);
	
	var geo = mergeMeshes(meshes);
	var mesh = new THREE.Mesh(geo, carMaterial);

	//SpotLight( color, intensity, distance, angle, penumbra, decay )
	spotLightL = new THREE.SpotLight( 0xffffff, 10, 100, .5, .3, 2);
	spotLightL.position.set( 0, 3, -1 );
	spotLightL.target.position.set(-10,car.position.y-1,car.position.z);
	car.add(spotLightL);
	car.add(spotLightL.target);
	spotLightL.visible=true;
	spotLightL.updateMatrixWorld();

	spotLightR = new THREE.SpotLight( 0xffffff, 10, 100, .5, .3, 2);
	spotLightR.position.set( 0, 3, 3 );
	spotLightR.target.position.set(-10,car.position.y-1,car.position.z);
	car.add(spotLightR);
	car.add(spotLightR.target);
	spotLightR.visible=true;
	spotLightR.updateMatrixWorld();

	car.add(mesh);
	car.position.set(x,y,z);
	objectsgroup.add(car);
}

function addTejadilho(full, material, x, y, z){
	var length = 2, width = 1;
	var shape = new THREE.Shape();
	shape.moveTo( 0,0 );
	shape.lineTo( 0, width );
	shape.lineTo( length, width );
	shape.lineTo( length, 0 );
	shape.lineTo( 0, 0 );
	
	var extrudeSettings = {
		steps: 1,
		amount: 1,
		bevelEnabled: true,
		bevelThickness: 1,
		bevelSize: 1.5,
		bevelSegments: 1
	};
	var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
	var mesh = new THREE.Mesh( geometry, material ) ;
	mesh.position.set(x, y, z);
	mesh.rotateX(Math.PI/2);
	full.push(mesh);
}

//draws the cubes (car body)
function addCube(full, material, x, y, z, width, height, depth) {
	var geometry = new THREE.BoxGeometry(width, height, depth, 2, 1, 2);
	var mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	full.push(mesh);
}
//draws the torus
function addTorus(full, material, x, y, z, outRadius, inRadius, radSeg,tubSeg, isChe) {
	var geometry = new THREE.TorusGeometry(outRadius, inRadius, radSeg, tubSeg);
	var mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	if (isChe){
		mesh.rotateX(Math.PI/2);
	}
	full.push(mesh);
}
/********************************************************************************************
					Functions to create the oranges
********************************************************************************************/
function createOrange(orange,x,y,z) {
	var meshes= [];
	var orangeMaterial = new THREE.MeshPhongMaterial( {color: 0xff8c00, wireframe: true, shininess: 100, map: orange_text });
	var orangeMaterial1 = new THREE.MeshPhongMaterial( {color: 0xf2f2f2, wireframe: true, shininess: 100 });
	orangeBody(meshes, orangeMaterial, 5, 8, 8, 0, 0, 0);
	orangeCaule(meshes, orangeMaterial1, 1, 5, 5, 0, 0, 0.4 );
	var geo = mergeMeshes(meshes);
	var mesh = new THREE.Mesh(geo, orangeMaterial);
	orange.add(mesh);
	orange.position.set(x, y, z);
	objectsgroup.add( orange );
}

function orangeBody(full, orangeMaterial, radius, wiSeg, heiSeg, x, y, z){
	var geometry = new THREE.SphereGeometry( radius, wiSeg, heiSeg );
	var mesh = new THREE.Mesh( geometry, orangeMaterial );
	mesh.position.set(x, y, z);
	full.push(mesh);
}

function orangeCaule(full, orangeMaterial, radius, wiSeg, heiSeg, x, y, z){
	material = new THREE.MeshPhongMaterial({ color: 0x00ff00, wireframe: true});
	geometry = new THREE.SphereGeometry(radius,wiSeg,heiSeg);
	var geometry = new THREE.SphereGeometry( radius, wiSeg, heiSeg );
	var mesh = new THREE.Mesh( geometry, orangeMaterial );
	mesh.position.set(x+5, y, z);
	full.push(mesh);
}

function createOranges(){
	for (var i = 0; i < 3; i++){
		var o = new Orange();
		oranges.push(o); 
		obj_colision.push(o);
	}
}
/********************************************************************************************
					Functions to create the buttersticks
********************************************************************************************/
function createButterStick(butter,x,y,z) {
	var side = 1+(Math.round(Math.random()*3));
	var geometry = new THREE.BoxGeometry( 6, 4, 12 , 2, 1 , 1);
	var butterMaterial = new THREE.MeshPhongMaterial( { color: 0xEBDB00, wireframe: true, map: butter_text } );
	var mesh = new THREE.Mesh( geometry, butterMaterial);
	butter.add(mesh);
	butter.rotateY(Math.random()*180*Math.PI/2);
	switch(side){
		case 1:
			butter.position.set(-100-(Math.random()*40), 7, 134*Math.random()*2-134);
			break;
		case 2:
			butter.position.set(134*Math.random()*2-134, 7, -100-(Math.random()*40));
			break;
		case 3:
			butter.position.set(100+(Math.random()*40), 7, 134*Math.random()*2-134);
			break;
		case 4:
			butter.position.set(134*Math.random()*2-134, 7, 100+(Math.random()*40));
			break;
	}
	objectsgroup.add( butter );
}

function createButters(){
	for (var i = 0; i < 5; i++){
		new ButterStick();
	}
}
/********************************************************************************************
					Functions to create the cheerio
********************************************************************************************/
function createCheerio(cheerio, x, y, z) {
	var geometry = new THREE.TorusGeometry(1.5, 0.75, 4, 7);
	var cheerioMaterial = new THREE.MeshPhongMaterial( { color: 0xebb400, wireframe: true } );
	var mesh = new THREE.Mesh(geometry, cheerioMaterial);
	mesh.rotateX(Math.PI/2);
	cheerio.add(mesh);
	cheerio.position.set(x, y, z);
	objectsgroup.add( cheerio );
	cheerios.push(cheerio);
}

//function that draws all the cheerios
function addTrack(meshes, cheerioMaterial){
	var num = -140, i = -140;
	while (num < 140) {
		if (num < 100 && num >-100){
			
			new Cheerio( 100, 1, num);
			new Cheerio(-100, 1, num);
		}
		new Cheerio( 140, 1, num);
		new Cheerio(-140, 1, num);
		num+=10;
	}
	//inside line
	while (i < 140){
		if (i < 100 && i >-100){
			new Cheerio( i, 1,-100);
			new Cheerio( i, 1, 100);
		}
		new Cheerio( i, 1,-140);
		new Cheerio( i, 1, 140);
		i+=10;
	}
}
/********************************************************************************************
					Function to create a table
*********************************************************************************************/
//creating the table top
function addTableTop(obj,x,y,z) {
	material = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: true, map: table_text});
	geometry = new THREE.BoxGeometry(300,4,300, 5 , 1, 5);
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x,y,z);
	obj.add(mesh);
}

//starting line for the car to appear
function addStartingLine(obj,x,y,z){
	material = new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: true, map: start_text});
	geometry = new THREE.BoxGeometry(20,0.1,38, 2, 1, 2);
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x,y,z);
	obj.add(mesh);
}

//function that renders the table
function createTable(x,y,z) {
	table = new THREE.Object3D();
	addTableTop(table,0,0,0);
	addStartingLine(table,90,2,120);
	table.receiveShadow = true;
	scene.add(table);
	table.position.set(x,y,z);
}
/********************************************************************************************************
			Cameras creation (1 Orthographic and 2 Perspective)
********************************************************************************************************/
//camera creation
function createOrthoCamera() {
	camera[0] = new THREE.OrthographicCamera(-240, 240, 160, -160, -500, 500);
	//to set top camera set x and z to 0
	camera[0].position.set(0,150,0);
	camera[0].lookAt(scene.position);
}

function createPerspFixedCamera() {
	camera[1] = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 1000);
	//to set top camera set x and z to 0
	camera[1].position.set(0,150,150);
	camera[1].lookAt(scene.position);
}

function createPerspCarCamera() {
	camera[2] = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 1, 1000);
	//to set top camera set x and z to 0
	car.add(camera[2]);
	camera[2].position.set(30,50,0);
	camera[2].lookAt(scene.position);
}

function createLivesCamera() {
	camera[4] = new THREE.OrthographicCamera(-25,25,10,-10,-500,500);
	//to set top camera set x and z to 0
	camera[4].position.set(315,150,320);
	camera[4].lookAt(cars_lives[2].position);
	var aux = new THREE.SpotLight( 0xffffff, 1, 100, .5, .3, 0);
	aux.position.set(315,100,320);
	aux.target.position.copy(cars_lives[2].position);
	scene.add(aux);
	scene.add(aux.target);
}

//pause camera
function createPauseCamera() {
	camera[5] = new THREE.OrthographicCamera(-240, 240, 160, -160, -500, 500);
	//to set top camera set x and z to 0
	camera[5].position.set(1000,150,1000);
	camera[5].lookAt(pauseObj.position);
}

function createRestartCamera() {
	camera[6] = new THREE.OrthographicCamera(-240, 240, 160, -160, -500, 500);
	//to set top camera set x and z to 0
	camera[6].position.set(1500,150,1500);
	camera[6].lookAt(restartObj.position);
}
/**************************************************************************************
			Let there be lights!!!!!
 **************************************************************************************/
//directional lights (sun)
function createDirectionalLight() {
	dirLight = new THREE.DirectionalLight(0xffffff, 1);
	dirLight.position.set(0, 20, 0);
	dirLight.target.position.set( 0, 0, 0 );
	dirLight.target.updateMatrixWorld();
	
	scene.add(dirLight);
}

//point lights (candles)
function createPointLight(x, y, z, color) {
	var point = new THREE.PointLight(color, 2, 100, 2);
	point.position.set(x, y, z);
	scene.add(point);
	return point;
}

//physical candle creation
function createCandle(x, y, z) {
	// body...
	var material = new THREE.MeshPhongMaterial( {color: 0xff4321, wireframe: true });
	var geometry = new THREE.BoxGeometry(2, 2, 2, 2, 1, 2);
	var mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	scene.add(mesh);
}

//creating all 6 pointlights (including physical marking)
function createCandles(){
	createCandle(90,4,0);
	createCandle(-90,4,0);
	createCandle(-50,4,90);
	createCandle(-50,4,-90);
	createCandle(50,4,-90);
	createCandle(50,4,90);
	point_lights[0] = createPointLight(90,10,0, 0xffffff);
	point_lights[1] = createPointLight(-90,10,0, 0xffffff);
	point_lights[2] = createPointLight(50,10,-90, 0xffffff);
	point_lights[3] = createPointLight(-50,10,-90, 0xffffff);
	point_lights[4] = createPointLight(-50,10,90, 0xffffff);
	point_lights[5] = createPointLight(50,10,90, 0xffffff);
}

function addAmbientLight(){
    amb = new THREE.AmbientLight(0x202020);
    scene.add(amb);
}
/***********************************************************************
			Scene creation and recreation
************************************************************************/
//scene creation
function createScene() {
	scene = new THREE.Scene();
	scene.add(new THREE.AxisHelper(10));
	createTable(0,0,0);
	for (var i=0; i<5; i++){
		cars_lives[i] = new Car(310,4,310+(i*5));
		cars_lives[i].updateMaterial(2); 
	}
	car = new Car(105, 2, 120);	
	obj_colision.push(car);
	createOranges();
	addTrack();
	createButters();
	createDirectionalLight();
	createCandles();
	addPause();
	addRestart();
	scene.add(objectsgroup);
}

function restart(){
	for(var i=0; i<cheerios.length; i++){
		var position = cheerios[i].positioninit;
		cheerios[i].position.copy(position); 
	}
	for (var j=0;j<cars_lives.length;j++){
		cars_lives[j].visible = true;
	}
	pause = false;
}
/*******************************************************************************************
		Remove object
*************************************************************************************************/
function removeEntity(name) {
    scene.remove( name );
}
/*****************************************************************************************
					Experiments
******************************************************************************************/
function mergeMeshes (meshes) {
	var merged = new THREE.Geometry();
	for (var i = 0; i < meshes.length; i++) {
		meshes[i].updateMatrix();
		merged.merge(meshes[i].geometry, meshes[i].matrix);
	}
	return merged;
}
//creating the mesh for the pause texture
function addPause(){
	material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, map: pause_text});
	geometry = new THREE.BoxGeometry(300,1,300, 5 , 1, 5);
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(1120,0,1000);
	pauseObj = mesh;
	scene.add(mesh);
}
//creating the mesh for the restart texture
function addRestart() {
	material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, map: restart_text});
	geometry = new THREE.BoxGeometry(300,1,300, 5 , 1, 5);
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(1620,0,1500);	
	restartObj = mesh;
	scene.add(mesh);
}
/*****************************************************************************************
		Redimensioning window resizes scene
*****************************************************************************************/
//resizing window
function onResize() {
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	if (window.innerHeight > 0 && window.innerWidth > 0) {
		renderer.setSize(window.innerWidth,window.innerHeight);
	}
}

function changeMaterial(j){
	for ( var i = 0; i < objectsgroup.children.length ; i++ ) {
        objectsgroup.children[i].updateMaterial(j) ;
    }
}
/******************************************************************************************
		Key strokes (a,s,left, right, up, down, 1, 2, 3, 4(optional), c, n, g, l, r)
*******************************************************************************************/
function onKeyDown(e) {
	if (lives > 0){
		if (!pause){
			switch(e.keyCode){
				case 65: //a
				//case 97: //numpad1
					scene.traverse(function (node) {
						if (node instanceof THREE.Mesh) {
							node.material.wireframe = !node.material.wireframe;
							node.castShadow = !node.castShadow;
							node.receiveShadow = true;
						}
					});
					wireframe = !wireframe;
					break;
				/**************************** Car movement   ******************************************/
				case 37: //left
					if (!keyDOWN && !keyUP){
						break;
					}
					alpha = -2;
					rotate=true;
					break;
				case 38: //up
					stopDOWN=false;
					stopUP=false;
					keyUP=true;
					break;
				case 39: //right
					if (!keyDOWN && !keyUP){
						break;
					}
					alpha = 2;
					rotate=true;
					break;
				case 40: //down
					stopDOWN=false;
					stopUP=false;
					keyDOWN=true;
					break;
				/********************** Change cameras   **************************************/
				case 49: //1
					active_camera = 0;
					break;
				case 50: //2
					active_camera = 1;
					break;
				case 51: //3
					//car camera
					active_camera = 2;
					break;
				/****************************** Ilumination stuff ***************************/
				//sun on off
				case 78: //n
					dirLight.visible = !dirLight.visible;
					break;
				//stop ilumination calculation
				case 76: //L
					if (mode == 0){
						changeMaterial(2);
						mode = 2;
						old_mode = 0;
						break;
					}
					else if (mode == 1){
						changeMaterial(2);
						mode = 2;
						old_mode = 1;
						break;
					}
					else if (mode == 2){
						changeMaterial(old_mode);
						mode = old_mode;
						old_mode = 2;
						break;
					}
					break;
				//change between Gouraud and Phong
				case 71: //G
					if (mode == 0){
						changeMaterial(1);
						mode = 1;
						old_mode = 0;
						break;
					}
					else if (mode == 1){
						changeMaterial(0);
						mode = 0;
						old_mode = 1;
						break;
					}
					else if (mode == 2){
						changeMaterial(old_mode);
						mode = old_mode;
						old_mode = 2;
						break;
					}
					break;
				//candles on off
				case 67: //c
					for (var i=0; i<6;i++){
						point_lights[i].visible = !point_lights[i].visible;
					}
					break;
					
				/***************************	Reset and pause	******************************/
				//headlights on and off
				case 72: //h
					spot = !spot;
					console.log(spotLightL.visible);
					console.log(spotLightR.visible);
					spotLightL.visible = !spotLightL.visible;
					spotLightR.visible = !spotLightR.visible;
					break;
			}
		}
		//pause game with a texture message
		switch(e.keyCode){
			case 83: //S
				pause = !pause;
				if (pause){
					renderPause();
				}
				else{
					render();
					render2();
				}
				break;
		}
	}
	else{
		switch (e.keyCode) {
			case 82: //R
				lives= 5;
				restart();
				break;
		}
	}
}

function onKeyUP(e){
	switch (e.keyCode) {
		case 38: //up
			keyUP=false;
			stopUP=true;
			break;
		case 40: //down
			keyDOWN=false;
			stopDOWN=true;
			break;
	}
}
/************************************************************************************************
		Miscelaneous
*************************************************************************************************/
function checkMove(){
	var delta = clock.getDelta();
	hasColision();

	if (keyUP){
		car.moveUP(1, delta);
	}
	if (keyDOWN){
		car.moveDOWN(1, delta);
	}
	if (stopUP){
		car.moveDOWN(0, delta);
	}
	if (stopDOWN){
		car.moveUP(0, delta);
	}
	hasColision();
	move_cheerios(delta);
	if (!pause){
		update_oranges(delta);
	}
	if (rotate==true){
		car.rotate_vel(alpha);
		car.rotation.y=(-car.alpha)*(Math.PI/180);
		rotate=false;
	}
}

function update_oranges(delta){
	for (var i = oranges.length - 1; i >= 0; i--) {
		oranges[i].update_pos_table(delta);
		oranges[i].rotation.y += 5*delta;
		if (oranges[i].position.x < -200 || oranges[i].position.x > 200 ||
			oranges[i].position.z < -200 || oranges[i].position.z > 200 ){
			oranges[i].position.x = 134*Math.random()*2-134;
			oranges[i].position.y = 7;
			oranges[i].position.z = 134*Math.random()*2-134;
			oranges[i].alpha = Math.random()*360;
			oranges[i].renove_pos();
		}
	}
}

//how the cheerios move
function move_cheerios(delta) {
	for (var i = 0; i <cheerios.length ; i++) {
		if (cheerios[i].sentido && cheerios[i].velocity.length()>0.5){
			cheerios[i].moveDOWN(0 ,delta);
		}
		else if ((!(cheerios[i].sentido) && cheerios[i].velocity.length()>0.7)){
			cheerios[i].moveUP(0 ,delta);
		}
		cheerios[i].update_pos_table(delta);
	}
}

//checking for collisions
function hasColision() {
	for(var i = 0; i < objectsgroup.children.length-1; i++){
		//j = i + 1 -> important to avoid unecessary checks
		for(var j = i+1; j < objectsgroup.children.length; j++){
			var obj = objectsgroup.children[j];
			objectsgroup.children[i].checkCollisions(obj);
		}
	}
}
/************************************************************************************************
		Render functions
*************************************************************************************************/
//rendering scene with selected camera
function render() {
	renderer.setViewport(0,0,window.innerWidth,window.innerHeight);
	renderer.setScissor(0,0,window.innerWidth,window.innerHeight);
	renderer.setScissorTest( true );
	renderer.setClearColor(0x000000);
	renderer.render(scene,camera[active_camera]);
}
//cars representing lives
function render2(){
	renderer.setViewport(0,0,150,100);
	renderer.setScissor(0,0,150,100);
	renderer.setScissorTest( true );
	renderer.setClearColor(0x123456);
	renderer.render(scene, camera[4]);
}

function renderPause() {
	renderer.setViewport(0,0,window.innerWidth,window.innerHeight);
	renderer.setScissor(0,0,window.innerWidth,window.innerHeight);
	renderer.setScissorTest( true );
	renderer.setClearColor(0x000000);
	renderer.render(scene,camera[5]);
}

function renderRestart() {
	renderer.setViewport(0,0,window.innerWidth,window.innerHeight);
	renderer.setScissor(0,0,window.innerWidth,window.innerHeight);
	renderer.setScissorTest( true );
	renderer.setClearColor(0x000000);
	renderer.render(scene,camera[6]);
}
/************************************************************************************************
		Animate function
*************************************************************************************************/
function animate() {
	checkMove();
	if (!pause){
		render();
		render2();
	}
	else{
		renderPause();
		if (lives <= 0){
			renderRestart();
		}
	}
	requestAnimationFrame(animate);
}
/**********************************************************************************************
		Initiate Image processing
**********************************************************************************************/
function init(){
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMapEnabled = true;
	document.body.appendChild(renderer.domElement);
	createScene();
	createOrthoCamera();
	createLivesCamera();
	createPerspFixedCamera();
	createPerspCarCamera();
	createPauseCamera();
	createRestartCamera();
	render();
	render2();
	window.addEventListener("resize",onResize);
	window.addEventListener("keydown",onKeyDown);
	window.addEventListener("keyup", onKeyUP);
}