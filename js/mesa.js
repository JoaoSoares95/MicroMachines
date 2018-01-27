/*global THREE*/
/*************************************************************************************************
		Global vars
**************************************************************************************************/

var camera, scene, renderer;

var mesh, geometry, material, material1;

var ball, car, butter;
var VELMAXCAR = 2, VELMINCAR=0; // velocidades max e min
var _VELMAXCAR=-0.5; //velocidade max para andar para trás
var XCAR = 100, YCAR = 2.5, ZCAR = 128;

var keyUP=false, keyDOWN=false;
var stopUP=false, stopDOWN=false;
var clock = new THREE.Clock();
var alpha = 90;
var rotate=false;
var table;

/*************************************************************************************
		Oranges and Butter Sticks
*************************************************************************************/

function addButterSticks(){
	createButterStick(134*Math.random()*2-134 ,6,130*Math.random()*2-130 );
	createButterStick(134*Math.random()*2-134 ,6,130*Math.random()*2-130 );
	createButterStick(134*Math.random()*2-134 ,6,130*Math.random()*2-130 );
	createButterStick(134*Math.random()*2-134 ,6,130*Math.random()*2-130 );
	createButterStick(134*Math.random()*2-134 ,6,130*Math.random()*2-130 );
}

function addOranges(){
	createOrange(140*Math.random()*2-140 ,7,140*Math.random()*2-140 );
	createOrange(140*Math.random()*2-140 ,7,140*Math.random()*2-140 );
	createOrange(140*Math.random()*2-140 ,7,140*Math.random()*2-140 );
	//createOrange(140*Math.random()*2-140 ,7,140*Math.random()*2-140 );
	//createOrange(140*Math.random()*2-140 ,7,140*Math.random()*2-140 );
}

/************************************************************************************
		Track and Cheerios creation
************************************************************************************/

//track - primary version
function addTrack(){
	var num = -140, i = -140;
	
	//outside line
	while (num < 140) {
		if (num < 110 && num >-110){
			addCheerio(110, 2, num);
			addCheerio(-110, 2, num);
		}
		addCheerio(140, 2, num);
		addCheerio(-140, 2, num);
		num+=8;
	}
	//inside line
	
	while (i < 140){
		if (i < 110 && i >-110){
			addCheerio( i, 2, -110);
			addCheerio( i, 2, 110);
		}
		addCheerio( i, 2, -140);
		addCheerio( i, 2, 140);
		i+=8;
	}
}

//rendering the cheerios
function addCheerio(x,y,z) {
	'use strict';
	
	var geometry = new THREE.TorusGeometry( 1, 0.25, 2, 5 );
	var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
	var torus = new THREE.Mesh( geometry, material );

	torus.position.set(x,y,z);
	torus.rotateX(Math.PI/2);
	
	scene.add( torus );
}

/***********************************************************************************
		Functions for the car rendering
************************************************************************************/

//rendering the car attempt
function addCarBody(obj,x,y,z) {
	'use strict';
	
	geometry = new THREE.BoxGeometry(6,2,3);
	mesh = new THREE.Mesh(geometry, material1);
	mesh.position.set(x,y,z);
	
	obj.add(mesh);
}

//car wheel
function addCarWheel(obj,x,y,z) {
	'use strict';
	
	geometry = new THREE.TorusGeometry(1,.25,3);
	mesh = new THREE.Mesh(geometry, material1);
	mesh.position.set(x,y,z);
	
	obj.add(mesh);
}


//trying to define a car for the race
function createCar(x,y,z){
	'use strict';

	car = new THREE.Object3D();
	car.userData={velocity: 0};
	material1 = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true});
	
	
	addCarBody(car,0,1,0);
	//left back wheel
	addCarWheel(car,3,.5,-2);
	//right back wheel
	addCarWheel(car,3,.5,2);
	//left front wheel
	addCarWheel(car,-1,.5,-2);
	//right front wheel
	addCarWheel(car,-1,.5,2);
	
	
	car.position.x = x;
	car.position.y = y;
	car.position.z = z;	
	
	scene.add(car);
}

/********************************************************************************************
		Function to create a butter stick
*********************************************************************************************/

//creating a ball to jump on the table
function createButterStick(x,y,z){
	'use strict';
	
	butter = new THREE.Object3D();
	//butter.userData = { jumping: true, step: 0};
	
	material = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true});
	geometry = new THREE.BoxGeometry(5,10,15);
	mesh= new THREE.Mesh(geometry, material);
	
	//butter.rotateY(Math.PI/2);
	butter.add(mesh);
	butter.position.set(x,y,z);
	butter.rotateX(Math.random()*180*Math.PI/2);
	
	scene.add(butter);
}

/********************************************************************************************
		Function to create a orange
*********************************************************************************************/

//creating a ball to jump on the table
function createOrange(x,y,z){
	'use strict';
	
	ball = new THREE.Object3D();
	//ball.userData = { jumping: true, step: 0};
	
	material = new THREE.MeshBasicMaterial({ color: 0xff8c00, wireframe: true});
	geometry = new THREE.SphereGeometry(5,10,5);
	mesh = new THREE.Mesh(geometry, material);
	
	ball.add(mesh);
	ball.position.set(x,y,z);
	
	scene.add(ball);
}

/********************************************************************************************
		Function to create a table
*********************************************************************************************/

//creating the table top
function addTableTop(obj,x,y,z) {
	'use strict';
	
	geometry = new THREE.BoxGeometry(300,2,300);
	mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x,y,z);
	
	obj.add(mesh);
}

//function that renders the table (both top and legs)
function createTable(x,y,z) {
	'use strict';
	
	table = new THREE.Object3D();
	
	material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, wireframe: true});
	
	addTableTop(table,0,0,0);
	
	scene.add(table);
	
	table.position.x = x;
	table.position.y = y;
	table.position.z = z;	
}

/********************************************************************************************************
			Rendering function, camera and scene creation
********************************************************************************************************/



//camera creation
function createCamera() {
	'use strict';
	
	/*Different views -> chose the one you prefer*/
	//camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera = new THREE.OrthographicCamera(-240, 240, 160, -160, 0.1, 500);
	
	//to set top camera set x and z to 0
	camera.position.x = 0;
	camera.position.y = 150;
	camera.position.z = 0;
	camera.lookAt(scene.position);
}

//scene creation
function createScene() {
	'use strict';
	
	scene = new THREE.Scene();
	
	scene.add(new THREE.AxisHelper(10));
	
	createTable(0,0,0);
	
	createCar(XCAR,YCAR,ZCAR);
	addTrack();
	addOranges();
	addButterSticks();
}


/*****************************************************************************************
		Redimensioning window resizes scene
*****************************************************************************************/
//resizing window
function onResize() {
	'use strict'
	
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	if (window.innerHeight > 0 && window.innerWidth > 0) {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth,window.innerHeight);

	}

	//render();
}
/*
function onResize() {
	'use strict'
	
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	if (window.innerHeight > 0 && window.innerWidth > 0) {
		var aspect = window.innerWidth / window.innerHeight;

		if (aspect < 1){
			camera.left = -300 / 2;
			camera.right = 300 / 2;
			camera.up = 300 / aspect / 2;
			camera.bottom = -300 / aspect / 2;
		}
		else{
			camera.left = -300 / 2;
			camera.right = 300 / 2;
			camera.up = 300 / aspect / 2;
			camera.bottom = -300 / aspect / 2;
		}
		camera.updateProjectionMatrix();
	}
}
*/
/*
function onResize() {
	'use strict'
	
	//renderer.setSize(window.innerWidth, window.innerHeight);
	console.log(window.innerWidth);
	console.log(window.innerHeight);
	
	if (window.innerHeight > 0 && window.innerWidth > 0) {
		if (window.innerHeight >= window.innerWidth){
			camera = new THREE.OrthographicCamera(-window.screen.width/4, window.screen.width/4, window.screen.width/4, -window.screen.width/4, 0.1, 500);
		}
		else{
			camera = new THREE.OrthographicCamera(-window.screen.height/4, window.screen.height/4, window.screen.height/4, -window.screen.height/4, 0.1, 500);
		}
	}
	camera.position.x = 0;
	camera.position.y = 150;
	camera.position.z = 0;
	camera.lookAt(scene.position);
	//render();
}*/

/******************************************************************************************
		Key strokes (a,s)
*******************************************************************************************/
//a: fill objects, s: stops ball
function onKeyDown(e) {
	'use strict';
	
	switch(e.keyCode){
		
		case 65: //A
		case 97: //a
			scene.traverse(function (node) {
				if (node instanceof THREE.Mesh) {
					node.material.wireframe = !node.material.wireframe;
				}
			});
			break;

		case 37: //left
			//NEW ADD ON ZIP
			if (!keyDOWN && !keyUP){
				break;
			}
			alpha += 0.04;
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
			alpha -= 0.04;
			rotate=true;
			//rotate_car()
			break;

		case 40: //down
			stopDOWN=false;
			stopUP=false;
			keyDOWN=true;
			break;
	}
}

function rotate_car(){
	XCAR = car.position.x;
	ZCAR = car.position.z;
	YCAR = car.position.y;
	
	//car.translateX(-car.position.x);
	car.position.x = 0;
	//car.translateZ(-car.position.z);
	car.position.z = 0;
	//car.translateY(-car.position.y);
	car.position.y = 0;
	//console.log(car.rotation.y);
	car.rotation.y=(alpha-90)*(Math.PI/360)*500;
	//car.rotation.set(new THREE.Vector3( 0, (alpha-90)*(Math.PI/360), 0));
	//car.translateX(-car.position.x);
	car.position.x = XCAR;
	//car.translateZ(-car.position.z);
	car.position.z = ZCAR;
	//car.translateY(-car.position.y);
	car.position.y = YCAR;
	
	rotate=false;
}

function onKeyUP(e){
	switch (e.keyCode) {
		case 38: //up
			// code
			keyUP=false;
			stopUP=true;
			break;
		case 40: //down
			// code
			keyDOWN=false;
			stopDOWN=true;
			break;
	}
}

function moveDOWN(max, delta){
	if (car.userData.velocity<max) {
		car.userData.velocity+=delta;
	}
	else{
		car.userData.velocity=max;
	}
}

function moveUP(max, delta){
	var min=-max;
	
	//window.alert(car.userData.velocity+" " +min);
	if (car.userData.velocity > min) {
		car.userData.velocity-=delta;
	}
	else{
		car.userData.velocity = min;
	}
}

/*******************************************************************************************
		Remove object
*************************************************************************************************/


function removeEntity(name) {
    scene.remove( name );
}


/************************************************************************************************
		Miscelaneous
*************************************************************************************************/

function checkMove(){
	var delta = clock.getDelta();
	if (keyUP){
		//do..
		moveUP(1,delta);
	}
	if (keyDOWN){
		moveDOWN(1,delta);
		//do..
	}
	if (stopUP){
		//do..
		moveDOWN(0,delta);
	}
	if (stopDOWN){
		moveUP(0,delta);
		//do..
	}
	
	if (rotate==true){
		rotate_car()
	}
	
		car.translateX(car.userData.velocity*Math.sin(alpha*Math.PI/180));
		car.translateZ(car.userData.velocity*Math.cos(alpha*Math.PI/180));
	
	//var velocityCarZ = velocityCar + velocityCar*Math.cos(orientationCar*Math.PI/180)*now;
	
}


//rendering scene with created camera
function render() {
	'use strict';
	renderer.render(scene, camera);
}

//makes ball move
function animate() {
	'use strict';
	//window.alert((car.userData.velocity));
	//console.log(car.userData.velocity);
	checkMove();
	
	render();
	
	requestAnimationFrame(animate);	
}

/**********************************************************************************************
		Initiate Image processing
**********************************************************************************************/

function init(){
	'use strict';
	
	renderer = new THREE.WebGLRenderer({ antialias: true});
	
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	document.body.appendChild(renderer.domElement);
	
	createScene();
	createCamera();
	render();
	
	window.addEventListener("resize",onResize);
	window.addEventListener("keydown",onKeyDown);
	window.addEventListener("keyup", onKeyUP);
}