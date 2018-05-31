var camera, scene, renderer, controls,texture, mazeMesh;

// var meshs = [];
var castle=[];
var frontStairs=[];

var raycaster;

// var group = new THREE.Group();

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if ( havePointerLock ) {

  var element = document.body;

  var pointerlockchange = function ( event ) {

    if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

      controlsEnabled = true;
      controls.enabled = true;

      blocker.style.display = 'none';

    } else {

      controls.enabled = false;

      blocker.style.display = 'block';

      instructions.style.display = '';

    }

  };

  var pointerlockerror = function ( event ) {

    instructions.style.display = '';

  };

  // Hook pointer lock state change events
  document.addEventListener( 'pointerlockchange', pointerlockchange, false );
  document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
  document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

  document.addEventListener( 'pointerlockerror', pointerlockerror, false );
  document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
  document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

  instructions.addEventListener( 'click', function ( event ) {

    instructions.style.display = 'none';

    // Ask the browser to lock the pointer
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
    element.requestPointerLock();

  }, false );

} else {

  instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}

init();
animate();

var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();

function init() {
  raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
  // raycaster=new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3());
  console.log(raycaster);
  // PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )
  //FOV=how far you can see out your peripheral vision
  //aspect=how narrow or wide you fov is
  //near=nearest boundary you can see
  //far= farest boundary you can see
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
  // camera.position.y=230;
  // camera.position.x=17;
  // camera.position.z=700;

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x3d3d5c );
  // scene.fog = new THREE.Fog( 0xcccccc, 0, 750 );

// HemisphereLight( skyColor : Integer, groundColor : Integer, intensity : Float )
  var light = new THREE.HemisphereLight( 0xffffff, 0.5 );
  light.position.set( 0, 0, 0 );
  scene.add( light );

  controls = new THREE.PointerLockControls( camera );
  scene.add( controls.getObject() );

  var onKeyDown = function ( event ) {

    switch ( event.keyCode ) {

      case 38: // up
      case 87: // w
        moveForward = true;
        break;

      case 37: // left
      case 65: // a
        moveLeft = true; break;

      case 40: // down
      case 83: // s
        moveBackward = true;
        break;

      case 39: // right
      case 68: // d
        moveRight = true;
        break;

      case 32: // space
        if ( canJump === true ) velocity.y += 350;
        canJump = false;
        break;

    }

  };

  var onKeyUp = function ( event ) {

    switch( event.keyCode ) {

      case 38: // up
      case 87: // w
        moveForward = false;
        break;

      case 37: // left
      case 65: // a
        moveLeft = false;
        break;

      case 40: // down
      case 83: // s
        moveBackward = false;
        break;

      case 39: // right
      case 68: // d
        moveRight = false;
        break;

    }

  };

  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );
  // var vertices;
  
  // var loader = new THREE.STLLoader();
	// 			loader.load( 'maze.stl', function ( geometry = new THREE.Geometry()) {
  //         var mazeContainerTexture = new THREE.TextureLoader().load( "stoneWall.jpg" );
  //         mazeContainerTexture.wrapS = mazeContainerTexture.wrapT = THREE.RepeatWrapping;
  //         mazeContainerTexture.repeat.set( 1, 1 );
	// 				// var mazeContainerMaterial = new THREE.MeshPhongMaterial( { color: 0x000000, wireframe: true } );
  //         var mazeContainerMaterial = new THREE.MeshPhongMaterial( { map:mazeContainerTexture } );
  //         // var mazeContainerMaterial = new THREE.MeshPhongMaterial( { map:THREE.TextureLoader().load('stoneWall.jpg') } );
  //         
	// 				var mazecontainermesh = new THREE.Mesh( geometry, mazeContainerMaterial );
  //         // console.log("mazemesh",mazecontainermesh.position.x,mazecontainermesh.position.y,mazecontainermesh.position.z)
	// 				// mazecontainermesh.position.set(0,0,0);
	// 				mazecontainermesh.rotation.set(-Math.PI/2,0,0);
  //         // console.log("afterrotatemazemesh",mazecontainermesh.position.x,mazecontainermesh.position.y,mazecontainermesh.position.z)
  //         // console.log(mazecontainermesh.position)
	// 				// mesh.scale.set( 1000, 1000, 1000 );
	// 				// mesh.castShadow = true;
	// 				// mesh.receiveShadow = true;
  //         geometry.computeBoundingBox();
  //         // console.log(box)
  //         // console.log("hello",goemetry.faces)
  //         // console.log(geometry.attributes.position.array)
  //         // vertices=geometry.attributes.position.array
  //         console.log(geometry)
  //         console.log(geometry.faceVertexUvs)
  //         // console.log(geometry.boundingSphere)
	// 				scene.add( mazecontainermesh );
	// 			} );

  // meshs.push(frontRectMesh,rearRectMesh,sideRect1Mesh,sideRect2Mesh);
  
  // raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
  
  
  makeCastle();
  makeGround();

    
    //THIS MAKES THE DOOR MESH
    var mazeEnterancetexture = new THREE.TextureLoader().load( "mazeEnterance.png" );
    mazeEnterancetexture.wrapS = mazeEnterancetexture.wrapT = THREE.ClampToEdgeWrapping;
    var mazeEnterancegeometry = new THREE.PlaneGeometry( 100, 100, 100);
    //THESE TWO DO ESSENTIALLY THE SAME THING BUT USE PHONG IT HAS MORE VERSATILITY I THINK?
    var mazeEnterancematerial = new THREE.MeshPhongMaterial( {transparent: true,map: mazeEnterancetexture} );
    // var mazeEnterancematerial = new THREE.MeshLambertMaterial( {transparent: true,map: mazeEnterancetexture} );
    var mazeEnteranceMesh= new THREE.Mesh( mazeEnterancegeometry, mazeEnterancematerial );
    mazeEnteranceMesh.position.set(-48,0,937)
    scene.add(mazeEnteranceMesh);
    // meshs.push(mazeEnteranceMesh);

    

  // objects

  // var boxGeometry = new THREE.BoxGeometry( 20, 20, 20 );
  // 
  // for ( var i = 0, l = boxGeometry.faces.length; i < l; i ++ ) {
  // 
  //   var face = boxGeometry.faces[ i ];
  //   face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
  //   face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
  //   face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
  // 
  // }
  // 
  // for ( var i = 0; i < 500; i ++ ) {
  // 
  //   var boxMaterial = new THREE.MeshPhongMaterial( { specular: 0xffffff, flatShading: true, vertexColors: THREE.VertexColors } );
  //   boxMaterial.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
  // 
  //   var box = new THREE.Mesh( boxGeometry, boxMaterial );
  //   box.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
  //   box.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
  //   box.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;
  // 
  //   scene.add( box );
  //   objects.push( box );
  // 
  // }
  // console.log(raycaster.intersectObjects( objects ));
  //
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  // console.log("camera",camera,"rotation",camera.rotation);
  // console.log("controls",controls.getObject(),"rotation",controls.getObject().rotation);
  // console.log(raycaster);
  // console.log(meshs);
  // var box=new THREE.BoxGeometry(10,30,25);
  // box.rotateY(Math.PI*(7/36));
  // box.translate(30,0,100);
  // console.log(box);
  // var boxMesh=new THREE.Mesh(box);
  // // boxMesh.position.x=30;
  // // boxMesh.position.z=100;
  // box.computeBoundingBox();
  // box.boundingBox.rotation=new THREE.Euler(0,Math.PI/4,0,'XYZ');
  // console.log(box.boundingBox.rotation);
  // var center=boxMesh.geometry.boundingBox.getCenter(new THREE.Vector3());
  // console.log(boxMesh);
  // console.log(center);
  // console.log(boxMesh.localToWorld(center));
  // var hbox = new THREE.BoxHelper( boxMesh, 0xffff00 );
  // scene.add( hbox );
  // scene.add(boxMesh);
  // var axesHelper = new THREE.AxesHelper(100);
  // scene.add( axesHelper );
  console.log(castle);
  // addObjstoScene();
  

  //

  window.addEventListener( 'resize', onWindowResize, false );

}

function assignUVs(geometry) {

    geometry.faceVertexUvs[0] = [];

    geometry.faces.forEach(function(face) {

        var components = ['x', 'y', 'z'].sort(function(a, b) {
            return Math.abs(face.normal[a]) > Math.abs(face.normal[b]);
        });

        var v1 = geometry.vertices[face.a];
        var v2 = geometry.vertices[face.b];
        var v3 = geometry.vertices[face.c];

        geometry.faceVertexUvs[0].push([
            new THREE.Vector2(v1[components[0]], v1[components[1]]),
            new THREE.Vector2(v2[components[0]], v2[components[1]]),
            new THREE.Vector2(v3[components[0]], v3[components[1]])
        ]);

    });

    geometry.uvsNeedUpdate = true;
}


function makeGround(){
  // THIS MAKES THE GROUND
  var groundgeometry = new THREE.PlaneGeometry( 5000, 5000, 99, 99 );
    groundgeometry.rotateX( - Math.PI / 2 );
    // for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {
    // 
    //   geometry.vertices[ i ].y = 200 * Math.sin( i / 2 );
    // 
    // }
    var texture = new THREE.TextureLoader().load( "sand1.jpg" );
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 50, 50 );
    material = new THREE.MeshBasicMaterial( {map: texture} );
    groundmesh = new THREE.Mesh( groundgeometry, material );
    scene.add(groundmesh);
    // meshs.push(groundmesh);
}

function makeFrontRightSideStairs(material,startx,starty,startz){
  for(i=0;i<22;i++){
    var box=new THREE.BoxGeometry(40,5,6);
    box.rotateY(Math.PI/4);
    box.translate(startx,starty,startz);
    var mesh=new THREE.Mesh(box,material);
    scene.add(mesh);
    startx+=4.2426;
    starty+=5;
    startz+=4.2426;
    frontStairs.push(mesh);
  }
  startx=187.5-20.01;
  startz+=10;
  for(i=0;i<7;i++){
    var box=new THREE.BoxGeometry(40,5,6);
    box.translate(startx,starty,startz);
    var mesh=new THREE.Mesh(box,material);
    scene.add(mesh);
    starty+=5;
    startz+=6;
    frontStairs.push(mesh);
  }
  console.log(startx,starty,startz);
}

function makeFrontLeftSideStairs(material,startx,starty,startz){
  for(i=0;i<22;i++){
    var box=new THREE.BoxGeometry(40,5,6);
    box.rotateY(-Math.PI/4);
    box.translate(startx,starty,startz);
    var mesh=new THREE.Mesh(box,material);
    scene.add(mesh);
    startx-=4.2426;
    starty+=5;
    startz+=4.2426;
    frontStairs.push(mesh);
  }
  startx=-187.5+20.01;
  startz+=10;
  for(i=0;i<7;i++){
    var box=new THREE.BoxGeometry(40,5,6);
    box.translate(startx,starty,startz);
    var mesh=new THREE.Mesh(box,material);
    scene.add(mesh);
    starty+=5;
    startz+=6;
    frontStairs.push(mesh);
  }
  console.log(startx,starty,startz);
}

function makeCastle(){
  //THIS MAKES CASTLE LOOKING BUILDING IN THE MIDDLE OF THE WORLD
  var castleFloorTexture=new THREE.TextureLoader().load("marblefloor.jpg");
  castleFloorTexture.wrapS = castleFloorTexture.wrapT = THREE.RepeatWrapping;
  castleFloorTexture.repeat.set( .03,.03 );
  var castleFloorMaterial = new THREE.MeshPhongMaterial( {map:castleFloorTexture} );
  castleFloorMaterial.side = THREE.DoubleSide;
  
  var castleFloorGeo=new THREE.Geometry();
  castleFloorGeo.vertices.push(
    new THREE.Vector3(-187.5,1,72.335), //1
    new THREE.Vector3(-187.5,1,-187.5),//2
    new THREE.Vector3(0,1,250),//3
    // new THREE.Vector3(-9.835,1,250),//3
    new THREE.Vector3(187.5,1,-187.5),//4
    new THREE.Vector3(187.5,1,72.335),//5
    new THREE.Vector3(275,1,-15.165),//6
    new THREE.Vector3(540.165,1,250),//7
    new THREE.Vector3(275,1,515.165),//8
    new THREE.Vector3(187.5,1,427.665),//9
    new THREE.Vector3(187.5,1,687.5),//10
    new THREE.Vector3(-187.5,1,687.5),//11
    new THREE.Vector3(-187.5,1,427.665),//12
    new THREE.Vector3(-275,1,515.165),//13
    new THREE.Vector3(-540.165,1,250),//14
    new THREE.Vector3(-275,1,-15.165),//15
    // new THREE.Vector3(9.835,1,250)//16
  );
  castleFloorGeo.faces.push(
    new THREE.Face3(0,1,2),
    new THREE.Face3(1,2,3),
    new THREE.Face3(3,2,4),
    new THREE.Face3(4,2,6),
    new THREE.Face3(6,4,5),
    new THREE.Face3(6,2,8),
    new THREE.Face3(8,6,7),
    new THREE.Face3(8,2,9),
    new THREE.Face3(9,2,10),
    new THREE.Face3(10,2,11),
    new THREE.Face3(2,11,13),
    new THREE.Face3(13,12,11),
    new THREE.Face3(13,2,0),
    new THREE.Face3(13,0,14)
    // new THREE.Face3(8,9,12),
    // new THREE.Face3(9,13,12),
    // new THREE.Face3(12,13,3),
    // new THREE.Face3(3,13,17),
    // new THREE.Face3(17,16,3),
    // new THREE.Face3(16,17,7),
  );
  castleFloorGeo.computeFaceNormals();
  castleFloorGeo.computeVertexNormals();
  assignUVs(castleFloorGeo);
  var castleFloorMesh=new THREE.Mesh(castleFloorGeo,castleFloorMaterial);
  scene.add(castleFloorMesh);
  
  var mazeContainerTexture = new THREE.TextureLoader().load( "stoneWall.jpg" );
  mazeContainerTexture.wrapS = mazeContainerTexture.wrapT = THREE.RepeatWrapping;
  // mazeContainerTexture.wrapS = mazeContainerTexture.wrapT = THREE.MirroredRepeatWrapping;
  mazeContainerTexture.repeat.set( .005,.005 );
  var mazeContainerMaterial = new THREE.MeshPhongMaterial( {map:mazeContainerTexture} );
  // var mazeContainerMaterial = new THREE.MeshPhongMaterial( { color: 0x222222 , wireframe: true} );
  mazeContainerMaterial.side = THREE.DoubleSide;
  
  var frontRect = new THREE.BoxGeometry( 375, 900, 375 );
  frontRect.translate(0,0,500);
  var frontRectMesh=new THREE.Mesh(frontRect,mazeContainerMaterial);
  frontRectMesh.geometry.computeFaceNormals();
  frontRectMesh.geometry.computeVertexNormals();
  assignUVs(frontRectMesh.geometry);
  frontRectMesh.updateMatrix(); 
  frontRectMesh.geometry.applyMatrix( frontRectMesh.matrix );
  frontRectMesh.matrix.identity();
  makeStatic3dCubeorRect(frontRectMesh);
  scene.add(frontRectMesh);
  // meshs.push(frontRectMesh);
  
  var landingFrontStairsGeo=new THREE.Geometry();
  landingFrontStairsGeo.vertices.push(
    new THREE.Vector3(-72.335,50,312.5),
    new THREE.Vector3(72.335,50,312.5),
    new THREE.Vector3(-72.335,50,355.5),
    new THREE.Vector3(72.335,50,355.5)
  );
  landingFrontStairsGeo.faces.push(
    new THREE.Face3(0,1,2),
    new THREE.Face3(2,3,1)
  );
  var landingFrontStairsMaterial=new THREE.MeshBasicMaterial();
  landingFrontStairsMaterial.side=THREE.DoubleSide;
  var landingFrontStairsMesh=new THREE.Mesh(landingFrontStairsGeo,landingFrontStairsMaterial);
  frontStairs.push(landingFrontStairsMesh);
  scene.add(landingFrontStairsMesh);
  
  var frontStairsTexture = new THREE.TextureLoader().load( "stoneWall.jpg" );
  frontStairsTexture.wrapS = frontStairsTexture.wrapT = THREE.RepeatWrapping;
  frontStairsTexture.repeat.set( .005,.005 );
  // var frontStairsMaterial = new THREE.MeshPhongMaterial( {map:frontStairsTexture} );
  var frontStairsMaterial = new THREE.MeshPhongMaterial( {color:0xff0000} );
  frontStairsMaterial.side = THREE.DoubleSide;
  
  //stairs have rise of 5 on y and a run of 6 on z
  var f1Stair=new THREE.BoxGeometry(100,5,6);
  f1Stair.translate(0,2.5,412.5);
  var f1StairMesh=new THREE.Mesh(f1Stair,frontStairsMaterial);
  frontStairs.push(f1StairMesh);
  scene.add(f1StairMesh);
  
  var f2Stair=new THREE.BoxGeometry(90,5,6);
  f2Stair.translate(0,7.5,406.5);
  var f2StairMesh=new THREE.Mesh(f2Stair,frontStairsMaterial);
  frontStairs.push(f2StairMesh);
  scene.add(f2StairMesh);
  
  var f3Stair=new THREE.BoxGeometry(82,5,6);
  f3Stair.translate(0,12.5,400.5);
  var f3StairMesh=new THREE.Mesh(f3Stair,frontStairsMaterial);
  frontStairs.push(f3StairMesh);
  scene.add(f3StairMesh);
  
  var f4Stair=new THREE.BoxGeometry(76,5,6);
  f4Stair.translate(0,17.5,394.5);
  var f4StairMesh=new THREE.Mesh(f4Stair,frontStairsMaterial);
  frontStairs.push(f4StairMesh);
  scene.add(f4StairMesh);
  
  var f5Stair=new THREE.BoxGeometry(72,5,6);
  f5Stair.translate(0,22.5,388.5);
  var f5StairMesh=new THREE.Mesh(f5Stair,frontStairsMaterial);
  frontStairs.push(f5StairMesh);
  scene.add(f5StairMesh);
  
  var f6Stair=new THREE.BoxGeometry(70,5,6);
  f6Stair.translate(0,27.5,382.5);
  var f6StairMesh=new THREE.Mesh(f6Stair,frontStairsMaterial);
  frontStairs.push(f6StairMesh);
  scene.add(f6StairMesh);
  
  var f7Stair=new THREE.BoxGeometry(70,5,6);
  f7Stair.translate(0,32.5,376.5);
  var f7StairMesh=new THREE.Mesh(f7Stair,frontStairsMaterial);
  frontStairs.push(f7StairMesh);
  scene.add(f7StairMesh);
  
  var f8Stair=new THREE.BoxGeometry(70,5,6);
  f8Stair.translate(0,37.5,370.5);
  var f8StairMesh=new THREE.Mesh(f8Stair,frontStairsMaterial);
  frontStairs.push(f8StairMesh);
  scene.add(f8StairMesh);
  
  var f9Stair=new THREE.BoxGeometry(70,5,6);
  f9Stair.translate(0,42.5,364.5);
  var f9StairMesh=new THREE.Mesh(f9Stair,frontStairsMaterial);
  frontStairs.push(f9StairMesh);
  scene.add(f9StairMesh);
  
  var f10Stair=new THREE.BoxGeometry(70,5,6);
  f10Stair.translate(0,47.5,358.5);
  var f10StairMesh=new THREE.Mesh(f10Stair,frontStairsMaterial);
  frontStairs.push(f10StairMesh);
  scene.add(f10StairMesh);
  
  //front right side and left side stairs
  makeFrontRightSideStairs(frontStairsMaterial,78.185,55,346.65);
  makeFrontLeftSideStairs(frontStairsMaterial,-78.185,55,346.65);
    
  var frontUpstairsGeo = new THREE.Geometry();
  // console.log(ageometry);
  frontUpstairsGeo.vertices.push(
    //vertices of square
  	new THREE.Vector3(-187.5,200,687.5),//0
  	new THREE.Vector3(187.5,200,312.5),//1
  	new THREE.Vector3(-187.5,200,312.5),//2
    new THREE.Vector3(187.5,200,687.5),//3
    //Line one
    new THREE.Vector3(-187.5,200,562.5),//4
    new THREE.Vector3(-63,200,521),//5
    new THREE.Vector3(63,200,479),//6
    new THREE.Vector3(187.5,200,437.5),//7
    //Line Two
    new THREE.Vector3(-62.5,200,687.5),//8
    new THREE.Vector3(-21,200,563),//9
    new THREE.Vector3(21,200,437),//10
    new THREE.Vector3(62.5,200,312.5),//11
    //Line Three
    new THREE.Vector3(62.5,200,687.5),//12
    new THREE.Vector3(21,200,563),//13
    new THREE.Vector3(-21,200,437),//14
    new THREE.Vector3(-62.5,200,312.5), //15 
    //Line Four
    new THREE.Vector3(187.5,200,562.5),//16
    new THREE.Vector3(63,200,521),//17
    new THREE.Vector3(-63,200,479),//18
    // new THREE.Vector3(-62.5,100,312.5)//19
    new THREE.Vector3(-187.5,200,437.5)//19
  );
  
  frontUpstairsGeo.faces.push(
    new THREE.Face3(9,5,0),
    new THREE.Face3(8,0,9),
    new THREE.Face3(8,9,12),
    new THREE.Face3(9,13,12),
    new THREE.Face3(12,13,3),
    new THREE.Face3(3,13,17),
    new THREE.Face3(17,16,3),
    new THREE.Face3(16,17,7),
    new THREE.Face3(7,17,6),
    new THREE.Face3(7,6,1),
    new THREE.Face3(1,6,10),
    new THREE.Face3(10,1,11),
    new THREE.Face3(11,10,14),
    new THREE.Face3(14,11,15),
    new THREE.Face3(15,14,2),
    new THREE.Face3(2,18,14),
    new THREE.Face3(18,2,19),
    new THREE.Face3(19,18,5),
    new THREE.Face3(5,19,4),
    new THREE.Face3(5,0,4)

);
  frontUpstairsGeo.computeFaceNormals();
  frontUpstairsGeo.computeVertexNormals();
  assignUVs(frontUpstairsGeo);

  var frontUpstairsTexture = new THREE.TextureLoader().load( "wood3.jpg" );
  frontUpstairsTexture.wrapS = frontUpstairsTexture.wrapT = THREE.MirroredRepeatWrapping;
  frontUpstairsTexture.repeat.set(0.03, 0.03);
  var frontUpstairsMaterial = new THREE.MeshBasicMaterial( { map: frontUpstairsTexture } );
  frontUpstairsMaterial.side=THREE.DoubleSide;
  var frontUpstairsMesh=new THREE.Mesh(frontUpstairsGeo,frontUpstairsMaterial);
  scene.add(frontUpstairsMesh); 
  
  var rearRect= new THREE.BoxGeometry( 375, 1500, 375 );
  rearRect.vertices.push(
    //star2
    new THREE.Vector3(-104.6226,750,-39.1312), //8
    new THREE.Vector3(-25.429,750,-39.1312),//9
    new THREE.Vector3(0,750,-114.1312),//10
    new THREE.Vector3(25.429,750,-39.1312),//11
    new THREE.Vector3(104.6226,750,-39.1312),//12
    new THREE.Vector3(41.145,750,9.2376),//13
    new THREE.Vector3(64.6557,750,84.8598),//14
    new THREE.Vector3(0,750,39.1312),//15
    new THREE.Vector3(-64.6557,750,84.8598),//16
    new THREE.Vector3(-41.145,750,9.2376),//17
    new THREE.Vector3(187.5,750,9.2376),//18
    new THREE.Vector3(0,750,187.5),//19
    new THREE.Vector3(-187.5,750,9.2376)//20
  );
  rearRect.faces=[]
  rearRect.faces.push(
    new THREE.Face3(0,2,1),
    new THREE.Face3(2,3,1),
    new THREE.Face3(4,6,5),
    new THREE.Face3(6,7,5),
    // new THREE.Face3(4,5,1),
    // new THREE.Face3(5,0,1),
    new THREE.Face3(7,6,2),
    new THREE.Face3(6,3,2),
    new THREE.Face3(5,7,0),
    new THREE.Face3(7,2,0),
    new THREE.Face3(1,3,4),
    new THREE.Face3(3,6,4),
    //star2
    new THREE.Face3(4,8,9),
    new THREE.Face3(4,9,10),
    new THREE.Face3(4,10,1),
    new THREE.Face3(10,1,11),
    new THREE.Face3(11,1,12),
    new THREE.Face3(1,12,18),
    new THREE.Face3(13,12,18),
    new THREE.Face3(13,18,14),
    new THREE.Face3(18,14,0),//prob ?
    new THREE.Face3(14,19,0),
    new THREE.Face3(14,15,19),
    new THREE.Face3(15,16,19),
    new THREE.Face3(16,19,5),
    new THREE.Face3(16,5,20),
    new THREE.Face3(16,17,20),
    new THREE.Face3(8,17,20),
    new THREE.Face3(8,4,20)
  );
  
  var rearRectMesh=new THREE.Mesh(rearRect,mazeContainerMaterial);
  rearRectMesh.geometry.computeFaceNormals();
  rearRectMesh.geometry.computeVertexNormals();
  assignUVs(rearRectMesh.geometry);
  rearRectMesh.updateMatrix(); 
  rearRectMesh.geometry.applyMatrix( rearRectMesh.matrix );
  rearRectMesh.matrix.identity();
  makeStatic3dCubeorRect(rearRectMesh);
  scene.add(rearRectMesh);
  // meshs.push(rearRectMesh);
  
  var sideRect2=new THREE.BoxGeometry( 375, 1200, 375 );
  sideRect2.rotateY(Math.PI/4);
  sideRect2.translate(275,0,250);
  
  sideRect2.vertices.push(
    //sideRect2.1
    new THREE.Vector3(372.227,325,417.938),//8
    new THREE.Vector3(442.938,325,347.227),//9
    new THREE.Vector3(372.227,460,417.938),//10
    new THREE.Vector3(442.938,460,347.227),//11
    new THREE.Vector3(395.774,475,394.391),//12
    new THREE.Vector3(419.391,475,370.774), //13
    //sideRect2.2
    new THREE.Vector3(372.227,120,82.062),// 14
    new THREE.Vector3(442.938,120,152.773),// 15
    new THREE.Vector3(395.775,100,105.609),// 16
    new THREE.Vector3(419.391,100,129.226),// 17
    new THREE.Vector3(372.227,230,82.062),// 18
    new THREE.Vector3(442.938,230,152.773),// 19
    new THREE.Vector3(395.775,250,105.609),// 20
    new THREE.Vector3(419.391,250,129.226)// 21
  );

  sideRect2.faces=[];
  sideRect2.faces.push(
  new THREE.Face3(4,6,5),
  new THREE.Face3(6,7,5),
  new THREE.Face3(4,5,1),
  new THREE.Face3(5,0,1),
  new THREE.Face3(7,6,2),
  new THREE.Face3(6,3,2),
  new THREE.Face3(1,3,4),
  new THREE.Face3(3,6,4),
  //side2.1
  new THREE.Face3(5,10,12),
  new THREE.Face3(5,12,13),
  new THREE.Face3(5,13,0),
  new THREE.Face3(0,13,11),
  new THREE.Face3(0,11,2),
  new THREE.Face3(2,11,9),
  new THREE.Face3(2,9,7),
  new THREE.Face3(7,9,8),
  new THREE.Face3(8,7,10),
  new THREE.Face3(10,7,5),
  //side2.2
  new THREE.Face3(14,1,18),
  new THREE.Face3(18,1,20),
  new THREE.Face3(20,1,21),
  new THREE.Face3(21,1,0),
  new THREE.Face3(21,0,19),
  new THREE.Face3(19,0,2),
  new THREE.Face3(19,15,2),
  new THREE.Face3(15,17,2),
  new THREE.Face3(17,3,2),
  new THREE.Face3(16,17,3),
  new THREE.Face3(3,14,16),
  new THREE.Face3(14,1,3)
);
  
  var sideRect2Mesh=new THREE.Mesh(sideRect2,mazeContainerMaterial);
  sideRect2Mesh.geometry.computeFaceNormals();
  sideRect2Mesh.geometry.computeVertexNormals();
  assignUVs(sideRect2Mesh.geometry);
  sideRect2Mesh.updateMatrix(); 
  sideRect2Mesh.geometry.applyMatrix( sideRect2Mesh.matrix );
  sideRect2Mesh.matrix.identity();
  makeStatic3dCubeorRect(sideRect2Mesh);
  console.log("siderect2",sideRect2);
  scene.add(sideRect2Mesh);
  // meshs.push(sideRect2Mesh);
  

  var sideRect1=new THREE.BoxGeometry( 375, 1200, 375 );
  sideRect1.rotateY((Math.PI/4));
  sideRect1.translate(-275,0,250);
  // var sideRect1Floor=createCastleFloor(sideRect1.vertices[0],sideRect1.vertices[1],sideRect1.vertices[4],sideRect1.vertices[5])
  
  sideRect1.vertices.push(
    // sideRect1.1
    new THREE.Vector3(-372.227,325,417.938),//8
    new THREE.Vector3(-442.938,325,347.227),//9
    new THREE.Vector3(-372.227,460,417.938),//10
    new THREE.Vector3(-442.938,460,347.227),//11
    new THREE.Vector3(-395.774,475,394.391),//12
    new THREE.Vector3(-419.391,475,370.774), //13
    //sideRect2.2
    new THREE.Vector3(-372.227,120,82.062),// 14
    new THREE.Vector3(-442.938,120,152.773),// 15
    new THREE.Vector3(-395.775,100,105.609),// 16
    new THREE.Vector3(-419.391,100,129.226),// 17
    new THREE.Vector3(-372.227,230,82.062),// 18
    new THREE.Vector3(-442.938,230,152.773),// 19
    new THREE.Vector3(-395.775,250,105.609),// 20
    new THREE.Vector3(-419.391,250,129.226)// 21
  );

  sideRect1.faces=[];
  sideRect1.faces.push(
    new THREE.Face3(0,2,1),
    new THREE.Face3(2,3,1),
    // new THREE.Face3(4,6,5),
    // new THREE.Face3(6,7,5),
    new THREE.Face3(4,5,1),
    new THREE.Face3(5,0,1),
    new THREE.Face3(7,6,2),
    new THREE.Face3(6,3,2),
    new THREE.Face3(5,7,0),
    new THREE.Face3(7,2,0),
    // new THREE.Face3(1,3,4),
    // new THREE.Face3(3,6,4),
    //side1.1
    new THREE.Face3(5,10,12),
    new THREE.Face3(5,12,4),
    new THREE.Face3(4,13,12),
    new THREE.Face3(4,13,11),
    new THREE.Face3(4,11,9),
    new THREE.Face3(4,9,6),
    new THREE.Face3(8,9,6),
    new THREE.Face3(7,6,8),
    new THREE.Face3(8,7,5),
    new THREE.Face3(5,8,10),
    //side 1.2
    new THREE.Face3(14,1,18),
    new THREE.Face3(18,1,20),
    new THREE.Face3(20,1,21),
    new THREE.Face3(21,1,4),
    new THREE.Face3(21,4,19),
    new THREE.Face3(19,4,6),
    new THREE.Face3(19,15,6),
    new THREE.Face3(15,17,6),
    new THREE.Face3(17,3,6),
    new THREE.Face3(16,17,3),
    new THREE.Face3(3,14,16),
    new THREE.Face3(14,1,3)
  );
  
  var sideRect1Mesh=new THREE.Mesh(sideRect1,mazeContainerMaterial);
  sideRect1Mesh.geometry.computeFaceNormals();
  sideRect1Mesh.geometry.computeVertexNormals();
  assignUVs(sideRect1Mesh.geometry);
  sideRect1Mesh.updateMatrix(); 
  sideRect1Mesh.geometry.applyMatrix( sideRect1Mesh.matrix );
  sideRect1Mesh.matrix.identity();
  makeStatic3dCubeorRect(sideRect1Mesh);
  scene.add(sideRect1Mesh);
  // meshs.push(sideRect1Mesh);
}

// function addObjstoScene(){
//   for(i=0;i<meshs.length;i++){
//     scene.add(meshs[i]);
//   }
// }

function makeStatic3dCubeorRect(mesh){
  // mesh.geometry.computeBoundingBox();
  // var center=mesh.geometry.boundingBox.getCenter(new THREE.Vector3());
  
  var vector1=mesh.geometry.vertices[0];
  var vector2=mesh.geometry.vertices[1];
  var vector3=mesh.geometry.vertices[4];
  var vector4=mesh.geometry.vertices[5];
  verts=[vector1,vector2,vector3,vector4];
  sides=makeSides(verts);
  var object=new Static3dCubeorRect(mesh,sides);
  castle.push(object);
}

function makeSides(vertsIn){
  sides=[];
  for(i=0;i<vertsIn.length;i++){
    var vert1;
    var vert2;
    if(i+1==vertsIn.length){
      vert1=vertsIn[vertsIn.length-1];
      vert2=vertsIn[0];
    }else{
      vert1=vertsIn[i];
      vert2=vertsIn[i+1];
    }
    var side=new rectorsquareside(vert1,vert2);
    sides.push(side);
  }
  // console.log(sides);
  return sides;
}
//FINISH WRITING THIS METHOD AND MAKE SURE THAT MAKESIDES METHOD WORKS
function isInsideBuilding(playerPos){
  var triangleArea=0;
  var isInside=false;
  // playerPos=controls.getObject().position;
  // console.log(playerPos);
  for(i=0;i<castle.length;i++){
    // rect=castle[i];
    triangleArea=0;
    for (j=0;j<castle[i].sides.length;j++){
      side=castle[i].sides[j]
      // rectSides=rect.sides;
      // h=Math.sqrt((castle[i].sides[j].halfx-playerPos.x)**2 + (castle[i].sides[j].halfz-playerPos.z)**2);
      // console.log(h);

      // b=arrayIn[i].sides[j].length
      // area=.5*castle[i].sides[j].base*h
      //PLAYERPOS is 1 VECT1 is 2 and VECT2 is 3
      // var area=0;
      var area=.5*(playerPos.x*(side.vert1.z-side.vert2.z) + side.vert1.x*(side.vert2.z-playerPos.z) + side.vert2.x*(playerPos.z-side.vert1.z));      
      triangleArea=triangleArea+Math.abs(area);
      
    //   if (count%50==0){
    //     console.log("Playerpos",playerPos)//,"vert1: ",side.vert1,"vert2: ",side.vert2,"\n");
    //   }
     }
    // if (count%50==0){
    //   console.log("Tirarea: ",triangleArea,"Squarearea: ",castle[i].area,"playerPos: ", playerPos, castle[i].mesh, "i: ",i);
    //   // console.log(playerPos);
    //   if(triangleArea==castle[i].area){
    //     console.log("you are inside the box");
    //     break;
    //   }else{
    //     console.log("you are outside the box");
    //   }
    // }
    
    if(Math.round(triangleArea)==castle[i].area){
      // console.log("you are inside the box",triangleArea);
      // break;
      isInside=true;
      return isInside;
     }
     //else{
    //   // console.log("you are outside the box",triangleArea);
    // }
  }
}

function ascendStairs(stairs){
  
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}


var count=0;
function animate() {
  

  requestAnimationFrame( animate );

  if ( controlsEnabled === true ) {
    playerPos=controls.getObject().position;
    // console.log(playerPos);
    if (count%30==0){
  console.log(playerPos);
  console.log("before",controls.getObject().position);
  // console.log("camerarotation",camera.rotation);
  // console.log("controlsrotation",controls.getObject().rotation);
  // console.log
    }
  
    // raycaster.ray.origin.copy( controls.getObject().position );
    // raycaster.ray.origin.y -= 10;
    // raycaster.set(camera.position,camera.position.normalize());
    // var intersections = raycaster.intersectObjects( objects );
    // // console.log(intersections)
    // // console.log(raycaster.intersectObjects( objects ));
    // var onObject = intersections.length > 0;
    // console.log(onObject)
    var isInside=isInsideBuilding(playerPos);
    // console.log(isInside);
    if(isInside){
      // if(-50<playerPos.x && playerPos.x<50 && 408<playerPos.z && playerPos.z<416){
        // ascendStairs(frontStairs);
        //  var vector = controls.target.clone().subSelf( controls.object.position ).normalize();
        // var vector=playerPos.normalize()
        // var raycaster = new THREE.Raycaster( playerPos, vector );
        // var intersects = raycaster.intersectObjects(frontStairs[0]);
        raycaster.ray.origin.copy(controls.getObject().position);
        // raycaster.ray.direction.copy(playerPos.normalize());
        raycaster.ray.origin.y -= 10;//it is minus ten because the y control position is set up ten console.log(controls.getObject());
        var intersections = raycaster.intersectObjects(frontStairs);
      
        if(intersections.length > 0){
          // console.log(intersections);
          controls.getObject().position.y=intersections[0].point.y+12.5;
          if (count%25==0){
          console.log("inside",controls.getObject().position);
        }
        }
        // console.log(intersections);
    //  }
    }
    if (count%25==0){
    console.log("after",controls.getObject().position);
  }
    count++;
    var time = performance.now();
    var delta = ( time - prevTime ) / 1000;

    velocity.x -= velocity.x * 5 * delta;
    velocity.z -= velocity.z * 5 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number( moveForward ) - Number( moveBackward );
    direction.x = Number( moveLeft ) - Number( moveRight );
    direction.normalize(); // this ensures consistent movements in all directions

    if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
    if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

    // if ( onObject === true ) {
    // 
    //   velocity.y = Math.max( 0, velocity.y );
    //   canJump = true;
    // 
    // }

    controls.getObject().translateX( velocity.x * delta );
    controls.getObject().translateY( velocity.y * delta );
    controls.getObject().translateZ( velocity.z * delta );

    if ( controls.getObject().position.y < 10 ) {

      velocity.y = 0;
      controls.getObject().position.y = 10;

      canJump = true;

    }

    prevTime = time;
    // for(i=0;i<objects.length;i++){
    //   objects[i].computeBoundingBox();
    //   // objects[i].center();
    //   var collision = objects[i].boundingBox.containsPoint(controls.getObject().position);
    //   if(collision){
    //     // console.log("collided");
    //   }
    //   }
      // console.log(collision);
    
    // mazeMesh.geometry.computeBoundingBox();
    // // mazeMesh.geometry.center()
    // var collision = mazeMesh.geometry.boundingBox.containsPoint(controls.getObject().position);
    // console.log(collision);
    
    // isInsideBuilding();

  }

  renderer.render( scene, camera );

}


















// var container;
// var camera, scene, renderer;
// var mouseX = 0, mouseY = 0;
// var windowHalfX = window.innerWidth / 2;
// var windowHalfY = window.innerHeight / 2;
// 
// init();
// animate();
// 
// function init() {
//   container = document.createElement('div');
//   document.body.appendChild(container);
// 
//   camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
//   camera.position.z = 100;
// 
//   // scene
//   scene = new THREE.Scene();
// 
//   var ambient = new THREE.AmbientLight(0xbbbbbb);
//   scene.add(ambient);
// 
//   var directionalLight = new THREE.DirectionalLight(0xdddddd);
//   directionalLight.position.set(0, 0, 1);
//   scene.add(directionalLight);
// 
//   // texture
//   var manager = new THREE.LoadingManager();
//   manager.onProgress = function(item, loaded, total) {
// 
//     console.log(item, loaded, total);
// 
//   };
// 
//   var texture = new THREE.Texture();
// 
//   var onProgress = function(xhr) {
//     if (xhr.lengthComputable) {
//       var percentComplete = xhr.loaded / xhr.total * 100;
//       console.log(Math.round(percentComplete, 2) + '% downloaded');
//     }
//   };
// 
//   var onError = function(xhr) {};
// 
//   var loader = new THREE.ImageLoader(manager);
//    loader.load('stoneWall.jpg', function(image) {
// 
//     texture.image = image;
//     texture.needsUpdate = true;
// 
//   });
// 
//   // model
//   // var loader = new THREE.STLLoader(manager);
//   // 				loader.load( 'maze.stl', function ( object ) {
//   //           object.traverse(function(child){
//   //             if (child instanceof THREE.Mesh){
//   //               child.material.map=texture
//   //             }
//   // 				} );
//   var loader = new THREE.OBJLoader(manager);
//   loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/286022/Bulbasaur.obj', function(object) {
//   
//     object.traverse(function(child) {
//   
//       if (child instanceof THREE.Mesh) {
//   
//         child.material.map = texture;
//   
//       }
//   
//     });
// 
//     // console.log(object.getAttribute('position'));
//     console.log(object)
//     object.scale.x = 45;
//     object.scale.y = 45;
//     object.scale.z = 45;
//     object.rotation.y = 3;
//     object.position.y = -10.5;
//     scene.add(object);
// 
//   }, onProgress, onError);
// 
//   renderer = new THREE.WebGLRenderer({ alpha: true });
//   renderer.setPixelRatio(window.devicePixelRatio);
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   container.appendChild(renderer.domElement);
// 
//   document.addEventListener('mousemove', onDocumentMouseMove, false);
// 
//   window.addEventListener('resize', onWindowResize, false);
// 
// }
// 
// function onWindowResize() {
// 
//   windowHalfX = window.innerWidth / 2;
//   windowHalfY = window.innerHeight / 2;
// 
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
// 
//   renderer.setSize(window.innerWidth, window.innerHeight);
// 
// }
// 
// function onDocumentMouseMove(event) {
// 
//   mouseX = (event.clientX - windowHalfX) / 2;
//   mouseY = (event.clientY - windowHalfY) / 2;
// 
// }
// 
// //
// 
// function animate() {
// 
//   requestAnimationFrame(animate);
//   render();
// 
// }
// 
// function render() {
// 
//   camera.position.x += (mouseX - camera.position.x) * .05;
//   camera.position.y += (-mouseY - camera.position.y) * .05;
// 
//   camera.lookAt(scene.position);
// 
//   renderer.render(scene, camera);
// 
// }