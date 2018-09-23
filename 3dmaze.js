var camera, scene, renderer, controls,texture, mazeMesh; 

var castle=[];
var thingToStandOn=[];
var thingsToCollideWith=[];

var raycaster;
var beforeCollisiondirection=new THREE.Vector3();
var beforeCollisionpp=new THREE.Vector3();

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );
// var collisionRing=new CollisionRing();

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
var canJump = true;
var jumped=false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();

function init() {
  raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3(), 0, 10 );//ORIGINAL 0, 10 
  // raycaster1=new THREE.Raycaster(new THREE.Vector3(),new THREE.Vector3(0,-1,0),0,10);
  // console.log(raycaster);
  // PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )
  //FOV=how far you can see out your peripheral vision
  //aspect=how narrow or wide you fov is
  //near=nearest boundary you can see
  //far= farest boundary you can see
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
  // camera.position.y=230;
  // camera.position.x=0;
  // camera.position.z=700;

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x3d3d5c );
  // scene.fog = new THREE.Fog( 0xcccccc, 0, 750 );

// HemisphereLight( skyColor : Integer, groundColor : Integer, intensity : Float )
  var light = new THREE.HemisphereLight( 0xffffff, 0.5 );
  light.position.set( 0, 0, 0 );
  scene.add( light );

  controls = new THREE.PointerLockControls( camera );
  controls.getObject().position.y=25;
  controls.getObject().position.x=0;
  controls.getObject().position.z=0;
  // controls.getObject().position.x=183;
  scene.add( controls.getObject() );
  // controls.getObject().position.y=300;
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
        if (canJump){
          velocity.y = 350;
          canJump = false;
          // console.log("NEWJUMP");
          // snapShotPlayerposY=controls.getObject().position.y;
          // jumped=true;
        }
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
  // console.log(castle);
  // console.log("thingsToCollideWith",thingsToCollideWith);
  // addObjstoScene()
  
  // var vectors=makeVectors(new THREE.Vector3(1,0,2),new THREE.Vector3(-1,1,2),new THREE.Vector3(5,0,3));
  // //find vectors first
  // // var planeCoefficients=math.cross([-2,1,0],[4,0,1]);//these need to be the vectors found from the points
  // var planeCoefficients=math.cross(vectors[0],vectors[1]);//these need to be the vectors found from the points
  // var constantCoefficient=-(planeCoefficients[0]*1)-(planeCoefficients[1]*0)-(planeCoefficients[2]*2)
  // planeCoefficients[3]=-constantCoefficient;
  // // console.log(planeCoefficients[3]);
  // // var negxIntersect=math.intersect([105,66,72],[100,66,72],planeCoefficients);
  // var posxIntersect=math.intersect([105,66,72],[110,66,72],planeCoefficients);
  // // var negzIntersect=math.intersect([105,66,72],[105,66,67],planeCoefficients);
  // var poszIntersect=math.intersect([105,66,72],[105,66,77],planeCoefficients);
  // 
  // // var distance1=math.distance(negxIntersect,[105,66,72]);
  // var distance2=math.distance(posxIntersect,[105,66,72]);
  // // var distance3=math.distance(negzIntersect,[105,66,72]);
  // var distance4=math.distance(poszIntersect,[105,66,72]);
  // // console.log(planeCoefficients,constantCoefficient,intersectionPoint,distance);
  // // console.log("negx",distance1,"posx",distance2,"negz",distance3,"posz",distance4);
  // console.log("posx",distance2,"posz",distance4);
  console.log(thingsToCollideWith);
  
  console.log(0/0);
  console.log(1/0);
  console.log(0/1);
  console.log(Number.EPSILON);
  var arr=[1,2,3,4];
  // arr.pop();
  // console.log(arr);
  
  console.log(arr.slice(0,-1))
  
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
    thingToStandOn.push(groundmesh);
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
    thingToStandOn.push(mesh);
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
    thingToStandOn.push(mesh);
  }
  // console.log(startx,starty,startz);
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
    thingToStandOn.push(mesh);
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
    thingToStandOn.push(mesh);
  }
  // console.log(startx,starty,startz);
}

function makeCastle(){
  //THIS MAKES CASTLE LOOKING BUILDING IN THE MIDDLE OF THE WORLD
  var castleFloorTexture=new THREE.TextureLoader().load("marblefloor.jpg");
  castleFloorTexture.wrapS = castleFloorTexture.wrapT = THREE.RepeatWrapping;
  castleFloorTexture.repeat.set( .03,.03 );
  var castleFloorMaterial = new THREE.MeshPhongMaterial( {map:castleFloorTexture} );
  castleFloorMaterial.side = THREE.DoubleSide;
  
  // var woodBox=new THREE.BoxGeometry(100,100,100);
  // var woodBoxMesh=new THREE.Mesh(woodBox,castleFloorMaterial);
  // scene.add(woodBoxMesh);
  // thingToStandOn.push(woodBoxMesh);
  
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
  // thingToStandOn.push(castleFloorMesh); THIS IS GOOD
  scene.add(castleFloorMesh);
  
  var mazeContainerTexture = new THREE.TextureLoader().load( "stoneWall.jpg" );
  mazeContainerTexture.wrapS = mazeContainerTexture.wrapT = THREE.RepeatWrapping;
  // mazeContainerTexture.wrapS = mazeContainerTexture.wrapT = THREE.MirroredRepeatWrapping;
  mazeContainerTexture.repeat.set( .007,.007 );
  var mazeContainerMaterial = new THREE.MeshPhongMaterial( {map:mazeContainerTexture} );
  // var mazeContainerMaterial = new THREE.MeshPhongMaterial( { color: 0x222222 , wireframe: true} );
  mazeContainerMaterial.side = THREE.DoubleSide;
  
  var frontRect = new THREE.BoxGeometry( 375, 900, 375 );
  frontRect.translate(0,0,500);
//   var frontRect = new THREE.Geometry();
  // console.log(ageometry);
  frontRect.vertices.push(
    new THREE.Vector3(-87.5,0,687.5),//8
    new THREE.Vector3(-87.5,135,687.5),//9
    new THREE.Vector3(-58.3333333,180,687.5),//10
    new THREE.Vector3(0,225,687.5),//11
    new THREE.Vector3(58.3333333,180,687.5),//12
    new THREE.Vector3(87.5,135,687.5),//13
    new THREE.Vector3(87.5,0,687.5),//14
    //hallway1
    new THREE.Vector3(-161.33496,0,312.5),//15
    new THREE.Vector3(-161.33496,50,312.5),//16
    new THREE.Vector3(-136.33496,75,312.5),//17
    new THREE.Vector3(-111.33496,50,312.5),//18
    new THREE.Vector3(-111.33496,0,312.5),//19
    
    new THREE.Vector3(-161.33496,300,312.5),//20
    new THREE.Vector3(-161.33496,350,312.5),//21
    new THREE.Vector3(-136.33496,375,312.5),//22
    new THREE.Vector3(-111.33496,350,312.5),//23
    new THREE.Vector3(-111.33496,300,312.5),//24
    //hallway2
    new THREE.Vector3(111.33496,0,312.5),//25
    new THREE.Vector3(111.33496,50,312.5),//26
    new THREE.Vector3(136.33496,75,312.5),//27
    new THREE.Vector3(161.33496,50,312.5),//28
    new THREE.Vector3(161.33496,0,312.5),//29
    
    new THREE.Vector3(111.33496,300,312.5),//30
    new THREE.Vector3(111.33496,350,312.5),//31
    new THREE.Vector3(136.33496,375,312.5),//32
    new THREE.Vector3(161.33496,350,312.5),//33
    new THREE.Vector3(161.33496,300,312.5),//34
    //lefthand hallway
    new THREE.Vector3(-187.5,0,388.66504),//35
    new THREE.Vector3(-187.5,50,388.66504),//36
    new THREE.Vector3(-187.5,75,363.66504),//37
    new THREE.Vector3(-187.5,50,338.66504),//38
    new THREE.Vector3(-187.5,0,338.66504),//39
    
    new THREE.Vector3(-187.5,300,388.66504),//40
    new THREE.Vector3(-187.5,350,388.66504),//41
    new THREE.Vector3(-187.5,375,363.66504),//42
    new THREE.Vector3(-187.5,350,338.66504),//43
    new THREE.Vector3(-187.5,300,338.66504),//44
    //righthand hallway
    new THREE.Vector3(187.5,0,388.66504),//45
    new THREE.Vector3(187.5,50,388.66504),//46
    new THREE.Vector3(187.5,75,363.66504),//47
    new THREE.Vector3(187.5,50,338.66504),//48
    new THREE.Vector3(187.5,0,338.66504),//49
    
    new THREE.Vector3(187.5,300,388.66504),//50
    new THREE.Vector3(187.5,350,388.66504),//51
    new THREE.Vector3(187.5,375,363.66504),//52
    new THREE.Vector3(187.5,350,338.66504),//53
    new THREE.Vector3(187.5,300,338.66504),//54
      );
  frontRect.faces=[];
  frontRect.faces.push(
    new THREE.Face3(4,5,1),
    new THREE.Face3(5,0,1),
    new THREE.Face3(7,6,2),
    new THREE.Face3(6,3,2),
    //main door
    new THREE.Face3(7,8,9),
    new THREE.Face3(7,5,9),
    new THREE.Face3(9,5,10),
    new THREE.Face3(10,5,11),
    new THREE.Face3(5,11,0),
    new THREE.Face3(11,0,12),
    new THREE.Face3(12,0,13),
    new THREE.Face3(13,0,2),
    new THREE.Face3(14,13,2),
    //hallways
    new THREE.Face3(4,20,21),
    new THREE.Face3(4,21,22),
    new THREE.Face3(4,22,1),
    new THREE.Face3(1,22,23),
    new THREE.Face3(1,23,32),
    new THREE.Face3(32,23,31),
    new THREE.Face3(23,31,24),
    new THREE.Face3(31,24,30),
    new THREE.Face3(32,33,1),
    new THREE.Face3(1,33,34),
    new THREE.Face3(1,34,27),
    new THREE.Face3(1,27,28),
    new THREE.Face3(1,28,3),
    new THREE.Face3(28,3,29),
    new THREE.Face3(29,3,25),
    new THREE.Face3(25,3,6),
    new THREE.Face3(25,14,6),
    new THREE.Face3(14,15,6),
    new THREE.Face3(16,15,6),
    new THREE.Face3(16,6,4),
    new THREE.Face3(16,17,4),
    new THREE.Face3(17,20,4),
    new THREE.Face3(20,17,24),
    new THREE.Face3(17,24,30),
    new THREE.Face3(17,30,18),
    new THREE.Face3(18,26,30),
    new THREE.Face3(18,26,25),
    new THREE.Face3(18,25,19),
    new THREE.Face3(26,27,30),
    new THREE.Face3(30,34,27),
    
    new THREE.Face3(43,44,4),
    new THREE.Face3(43,4,42),
    new THREE.Face3(4,42,5),
    new THREE.Face3(42,5,41),
    new THREE.Face3(5,41,40),
    new THREE.Face3(40,37,5),
    new THREE.Face3(36,37,5),
    new THREE.Face3(37,36,7),
    new THREE.Face3(36,7,5),
    new THREE.Face3(36,35,7),
    new THREE.Face3(35,39,7),
    new THREE.Face3(39,7,6),
    new THREE.Face3(39,38,6),
    new THREE.Face3(6,38,4),
    new THREE.Face3(38,4,37),
    new THREE.Face3(37,44,4),
    new THREE.Face3(44,40,37),
    
    new THREE.Face3(1,52,0),
    new THREE.Face3(52,51,0),
    new THREE.Face3(0,51,50),
    new THREE.Face3(0,50,47),
    new THREE.Face3(0,47,46),
    new THREE.Face3(0,46,2),
    new THREE.Face3(46,2,45),
    new THREE.Face3(45,2,49),
    new THREE.Face3(49,2,3),
    new THREE.Face3(49,3,48),
    new THREE.Face3(48,3,1),
    new THREE.Face3(48,47,1),
    new THREE.Face3(47,54,1),
    new THREE.Face3(54,1,53),
    new THREE.Face3(53,1,52),
    new THREE.Face3(54,50,47)
    
    

);
  var frontRectMesh=new THREE.Mesh(frontRect,mazeContainerMaterial);
  frontRectMesh.geometry.computeFaceNormals();
  frontRectMesh.geometry.computeVertexNormals();
  assignUVs(frontRectMesh.geometry);
  frontRectMesh.updateMatrix(); 
  frontRectMesh.geometry.applyMatrix( frontRectMesh.matrix );
  frontRectMesh.matrix.identity();
  // makeStatic3dCubeorRect(frontRectMesh);
  thingsToCollideWith.push(frontRectMesh);
  scene.add(frontRectMesh);
  // meshs.push(frontRectMesh);
  
  
  
  
  // var sideRect2Mesh=new THREE.Mesh(sideRect2,mazeContainerMaterial);
  // sideRect2Mesh.geometry.computeFaceNormals();
  // sideRect2Mesh.geometry.computeVertexNormals();
  // assignUVs(sideRect2Mesh.geometry);
  // sideRect2Mesh.updateMatrix(); 
  // sideRect2Mesh.geometry.applyMatrix( sideRect2Mesh.matrix );
  // sideRect2Mesh.matrix.identity();
  // makeStatic3dCubeorRect(sideRect2Mesh);
  // // console.log("siderect2",sideRect2);
  // scene.add(sideRect2Mesh);
  // thingsToCollideWith.push(sideRect2Mesh);
  
  
  
  
  
  
  
  
  
  
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
  thingToStandOn.push(landingFrontStairsMesh);
  scene.add(landingFrontStairsMesh);
  
  var frontStairsTexture = new THREE.TextureLoader().load( "stoneWall.jpg" );
  frontStairsTexture.wrapS = frontStairsTexture.wrapT = THREE.RepeatWrapping;
  frontStairsTexture.repeat.set( .005,.005 );
  // var frontStairsMaterial = new THREE.MeshPhongMaterial( {map:frontStairsTexture} );
  var frontStairsMaterial = new THREE.MeshPhongMaterial( {color:0xff0000} );
  frontStairsMaterial.side = THREE.DoubleSide;
  
  // var fStair=new THREE.BoxGeometry(200,400,200);
  // var fStairMesh=new THREE.Mesh(fStair,frontStairsMaterial);
  // thingsToCollideWith.push(fStairMesh);
  // scene.add(fStairMesh);
  
  //stairs have rise of 5 on y and a run of 6 on z
  var f1Stair=new THREE.BoxGeometry(100,5,6);
  f1Stair.translate(0,2.5,412.5);
  var f1StairMesh=new THREE.Mesh(f1Stair,frontStairsMaterial);
  thingToStandOn.push(f1StairMesh);
  scene.add(f1StairMesh);
  
  var f2Stair=new THREE.BoxGeometry(90,5,6);
  f2Stair.translate(0,7.5,406.5);
  var f2StairMesh=new THREE.Mesh(f2Stair,frontStairsMaterial);
  thingToStandOn.push(f2StairMesh);
  scene.add(f2StairMesh);
  
  var f3Stair=new THREE.BoxGeometry(82,5,6);
  f3Stair.translate(0,12.5,400.5);
  var f3StairMesh=new THREE.Mesh(f3Stair,frontStairsMaterial);
  thingToStandOn.push(f3StairMesh);
  scene.add(f3StairMesh);
  
  var f4Stair=new THREE.BoxGeometry(76,5,6);
  f4Stair.translate(0,17.5,394.5);
  var f4StairMesh=new THREE.Mesh(f4Stair,frontStairsMaterial);
  thingToStandOn.push(f4StairMesh);
  scene.add(f4StairMesh);
  
  var f5Stair=new THREE.BoxGeometry(72,5,6);
  f5Stair.translate(0,22.5,388.5);
  var f5StairMesh=new THREE.Mesh(f5Stair,frontStairsMaterial);
  thingToStandOn.push(f5StairMesh);
  scene.add(f5StairMesh);
  
  var f6Stair=new THREE.BoxGeometry(70,5,6);
  f6Stair.translate(0,27.5,382.5);
  var f6StairMesh=new THREE.Mesh(f6Stair,frontStairsMaterial);
  thingToStandOn.push(f6StairMesh);
  scene.add(f6StairMesh);
  
  var f7Stair=new THREE.BoxGeometry(70,5,6);
  f7Stair.translate(0,32.5,376.5);
  var f7StairMesh=new THREE.Mesh(f7Stair,frontStairsMaterial);
  thingToStandOn.push(f7StairMesh);
  scene.add(f7StairMesh);
  
  var f8Stair=new THREE.BoxGeometry(70,5,6);
  f8Stair.translate(0,37.5,370.5);
  var f8StairMesh=new THREE.Mesh(f8Stair,frontStairsMaterial);
  thingToStandOn.push(f8StairMesh);
  scene.add(f8StairMesh);
  
  var f9Stair=new THREE.BoxGeometry(70,5,6);
  f9Stair.translate(0,42.5,364.5);
  var f9StairMesh=new THREE.Mesh(f9Stair,frontStairsMaterial);
  thingToStandOn.push(f9StairMesh);
  scene.add(f9StairMesh);
  
  var f10Stair=new THREE.BoxGeometry(70,5,6);
  f10Stair.translate(0,47.5,358.5);
  var f10StairMesh=new THREE.Mesh(f10Stair,frontStairsMaterial);
  thingToStandOn.push(f10StairMesh);
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
  thingToStandOn.push(frontUpstairsMesh); 
  
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
    new THREE.Vector3(-187.5,750,9.2376),//20
    //door
    new THREE.Vector3(-87.5,0,-187.5),//21
    new THREE.Vector3(-87.5,135,-187.5),//22
    new THREE.Vector3(-29.16666667,180,-187.5),//23
    new THREE.Vector3(0,225,-187.5),//24
    new THREE.Vector3(29.16666667,180,-187.5),//25
    new THREE.Vector3(87.5,135,-187.5),//26
    new THREE.Vector3(87.5,0,-187.5),//27
    
    //hallway1
    new THREE.Vector3(-161.33496,0,187.5),//28
    new THREE.Vector3(-161.33496,50,187.5),//29
    new THREE.Vector3(-136.33496,75,187.5),//30
    new THREE.Vector3(-111.33496,50,187.5),//31
    new THREE.Vector3(-111.33496,0,187.5),//32
    
    new THREE.Vector3(-161.33496,300,187.5),//33
    new THREE.Vector3(-161.33496,350,187.5),//34
    new THREE.Vector3(-136.33496,375,187.5),//35
    new THREE.Vector3(-111.33496,350,187.5),//36
    new THREE.Vector3(-111.33496,300,187.5),//37
    
    new THREE.Vector3(-161.33496,475,187.5),//38
    new THREE.Vector3(-161.33496,525,187.5),//39
    new THREE.Vector3(-136.33496,550,187.5),//40
    new THREE.Vector3(-111.33496,525,187.5),//41
    new THREE.Vector3(-111.33496,475,187.5),//42
    //hallway2
    new THREE.Vector3(111.33496,300,187.5),//43
    new THREE.Vector3(111.33496,350,187.5),//44
    new THREE.Vector3(136.33496,375,187.5),//45
    new THREE.Vector3(161.33496,350,187.5),//46
    new THREE.Vector3(161.33496,300,187.5),//47
    
    new THREE.Vector3(111.33496,0,187.5),//48
    new THREE.Vector3(111.33496,50,187.5),//49
    new THREE.Vector3(136.33496,75,187.5),//50
    new THREE.Vector3(161.33496,50,187.5),//51
    new THREE.Vector3(161.33496,0,187.5),//52
    
    new THREE.Vector3(111.33496,475,187.5),//53
    new THREE.Vector3(111.33496,525,187.5),//54
    new THREE.Vector3(136.33496,550,187.5),//55
    new THREE.Vector3(161.33496,525,187.5),//56
    new THREE.Vector3(161.33496,475,187.5),//57
    //righthand hallway
    new THREE.Vector3(187.5,0,111.33496),//58
    new THREE.Vector3(187.5,50,111.33496),//59
    new THREE.Vector3(187.5,75,136.33496),//60
    new THREE.Vector3(187.5,50,161.33496),//61
    new THREE.Vector3(187.5,0,161.33496),//62
    
    new THREE.Vector3(187.5,300,111.33496),//63
    new THREE.Vector3(187.5,350,111.33496),//64
    new THREE.Vector3(187.5,375,136.33496),//65
    new THREE.Vector3(187.5,350,161.33496),//66
    new THREE.Vector3(187.5,300,161.33496),//67
    // //lefthand hallway
    new THREE.Vector3(-187.5,0,111.33496),//68
    new THREE.Vector3(-187.5,50,111.33496),//69
    new THREE.Vector3(-187.5,75,136.33496),//70
    new THREE.Vector3(-187.5,50,161.33496),//71
    new THREE.Vector3(-187.5,0,161.33496),//72
    
    new THREE.Vector3(-187.5,300,111.33496),//73
    new THREE.Vector3(-187.5,350,111.33496),//74
    new THREE.Vector3(-187.5,375,136.33496),//75
    new THREE.Vector3(-187.5,350,161.33496),//76
    new THREE.Vector3(-187.5,300,161.33496),//77
    //righthand top hallway
    new THREE.Vector3(187.5,475,111.33496),//78
    new THREE.Vector3(187.5,525,111.33496),//79
    new THREE.Vector3(187.5,550,136.33496),//80
    new THREE.Vector3(187.5,525,161.33496),//81
    new THREE.Vector3(187.5,475,161.33496),//82
    //lefthand top hallway
    new THREE.Vector3(-187.5,475,111.33496),//83
    new THREE.Vector3(-187.5,525,111.33496),//84
    new THREE.Vector3(-187.5,550,136.33496),//85
    new THREE.Vector3(-187.5,525,161.33496),//86
    new THREE.Vector3(-187.5,475,161.33496),//87
    
    
  );
  rearRect.faces=[]
  rearRect.faces.push(
    // new THREE.Face3(0,2,1),
    // new THREE.Face3(2,3,1),
    // new THREE.Face3(4,6,5),
    // new THREE.Face3(6,7,5),
    // new THREE.Face3(4,5,1),
    // new THREE.Face3(5,0,1),
    // new THREE.Face3(7,6,2),
    // new THREE.Face3(6,3,2),
    // new THREE.Face3(5,7,0),
    // new THREE.Face3(7,2,0),
    // new THREE.Face3(1,3,4),
    // new THREE.Face3(3,6,4),
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
    new THREE.Face3(8,4,20),
    //door
    new THREE.Face3(6,22,21),
    new THREE.Face3(6,22,4),
    new THREE.Face3(22,23,4),
    new THREE.Face3(23,24,4),
    new THREE.Face3(4,24,1),
    new THREE.Face3(24,25,1),
    new THREE.Face3(25,26,1),
    new THREE.Face3(26,3,1),
    new THREE.Face3(26,27,3),
    //hallways
    new THREE.Face3(5,7,38),
    new THREE.Face3(5,38,39),
    new THREE.Face3(5,39,40),
    new THREE.Face3(40,5,0),
    new THREE.Face3(40,0,55),
    new THREE.Face3(55,0,56),
    new THREE.Face3(56,0,57),
    new THREE.Face3(57,0,2),
    new THREE.Face3(40,55,41),
    new THREE.Face3(55,41,54),
    new THREE.Face3(41,54,42),
    new THREE.Face3(54,42,53),
    new THREE.Face3(42,53,36),
    new THREE.Face3(42,36,35),
    new THREE.Face3(42,35,38),
    new THREE.Face3(38,35,34),
    new THREE.Face3(38,7,29),
    new THREE.Face3(53,44,36),
    new THREE.Face3(53,44,45),
    new THREE.Face3(53,45,57),
    new THREE.Face3(45,57,46),
    new THREE.Face3(57,51,2),
    new THREE.Face3(36,44,37),
    new THREE.Face3(44,43,37),
    new THREE.Face3(29,33,30),
    new THREE.Face3(33,37,30),
    new THREE.Face3(30,31,37),
    new THREE.Face3(37,31,43),
    new THREE.Face3(43,31,49),
    new THREE.Face3(49,43,50),
    new THREE.Face3(50,43,47),
    new THREE.Face3(50,51,47),
    new THREE.Face3(29,28,7),
    new THREE.Face3(28,32,7),
    new THREE.Face3(7,32,2),
    new THREE.Face3(48,2,32),
    new THREE.Face3(48,32,49),
    new THREE.Face3(32,49,31),
    new THREE.Face3(49,43,50),
    new THREE.Face3(50,43,47),
    new THREE.Face3(47,50,51),
    new THREE.Face3(51,2,52),
    new THREE.Face3(52,2,48),
    //side hallways
    new THREE.Face3(82,0,81),
    new THREE.Face3(81,0,80),
    new THREE.Face3(0,80,1),
    new THREE.Face3(80,1,79),
    new THREE.Face3(79,1,78),
    new THREE.Face3(78,1,64),
    new THREE.Face3(78,65,64),
    new THREE.Face3(78,65,82),
    new THREE.Face3(82,65,66),
    new THREE.Face3(82,2,62),
    new THREE.Face3(0,82,2),
    new THREE.Face3(61,67,60),
    new THREE.Face3(67,60,63),
    new THREE.Face3(60,63,59),
    new THREE.Face3(64,1,63),
    new THREE.Face3(63,1,59),
    new THREE.Face3(59,1,3),
    new THREE.Face3(59,58,3),
    new THREE.Face3(58,2,3),
    new THREE.Face3(58,2,62),
    
    new THREE.Face3(87,5,86),
    new THREE.Face3(86,85,5),
    new THREE.Face3(5,85,4),
    new THREE.Face3(85,4,84),
    new THREE.Face3(84,4,83),
    new THREE.Face3(83,4,69),
    new THREE.Face3(4,69,6),
    new THREE.Face3(69,6,68),
    new THREE.Face3(68,6,7),
    new THREE.Face3(68,7,72),
    new THREE.Face3(71,7,72),
    new THREE.Face3(71,7,87),
    new THREE.Face3(5,87,7),
    new THREE.Face3(87,76,75),
    new THREE.Face3(87,75,83),
    new THREE.Face3(75,83,74),
    new THREE.Face3(73,70,69),
    new THREE.Face3(77,70,73),
    new THREE.Face3(77,70,71),
  );
  
  var rearRectMesh=new THREE.Mesh(rearRect,mazeContainerMaterial);
  rearRectMesh.geometry.computeFaceNormals();
  rearRectMesh.geometry.computeVertexNormals();
  assignUVs(rearRectMesh.geometry);
  rearRectMesh.updateMatrix(); 
  rearRectMesh.geometry.applyMatrix( rearRectMesh.matrix );
  rearRectMesh.matrix.identity();
  // makeStatic3dCubeorRect(rearRectMesh);
  scene.add(rearRectMesh);
  thingsToCollideWith.push(rearRectMesh);
  // meshs.push(rearRectMesh);
  
  //rear Rect floors  
  var rearbottomFloor=new THREE.Geometry();
  rearbottomFloor.vertices.push(
    new THREE.Vector3(187.5,225,187.5),//0
    new THREE.Vector3(187.5,225,-187.5),//1
    new THREE.Vector3(-187.5,225,-187.5),//4 2
    new THREE.Vector3(-187.5,225,187.5),//5 3
    new THREE.Vector3(-104.6226,225,-39.1312), //8 4
    new THREE.Vector3(-25.429,225,-39.1312),//9 5
    new THREE.Vector3(0,225,-114.1312),//10 6
    new THREE.Vector3(25.429,225,-39.1312),//11 7
    new THREE.Vector3(104.6226,225,-39.1312),//12 8
    new THREE.Vector3(41.145,225,9.2376),//13 9
    new THREE.Vector3(64.6557,225,84.8598),//14 10
    new THREE.Vector3(0,225,39.1312),//15 11
    new THREE.Vector3(-64.6557,225,84.8598),//16 12
    new THREE.Vector3(-41.145,225,9.2376),//17 13
    new THREE.Vector3(187.5,225,9.2376),//18 14
    new THREE.Vector3(0,225,187.5),//19 15
    new THREE.Vector3(-187.5,225,9.2376)//20 16
  );
  
  rearbottomFloor.faces.push(
    new THREE.Face3(2,4,5),
    new THREE.Face3(2,5,6),
    new THREE.Face3(2,6,1),
    new THREE.Face3(6,1,7),
    new THREE.Face3(7,1,8),
    new THREE.Face3(1,8,14),
    new THREE.Face3(9,8,14),
    new THREE.Face3(9,14,10),
    new THREE.Face3(14,10,0),//prob ?
    new THREE.Face3(10,15,0),
    new THREE.Face3(10,11,15),
    new THREE.Face3(11,12,15),
    new THREE.Face3(12,15,3),
    new THREE.Face3(12,3,16),
    new THREE.Face3(12,13,16),
    new THREE.Face3(4,13,16),
    new THREE.Face3(4,2,16)
    
  );
  // console.log(rearbottomFloor);
  rearbottomFloor.computeFaceNormals();
  rearbottomFloor.computeVertexNormals();
  assignUVs(rearbottomFloor);
  var rearbottomFloorTexture = new THREE.TextureLoader().load( "wood3.jpg" );
  rearbottomFloorTexture.wrapS = rearbottomFloorTexture.wrapT = THREE.MirroredRepeatWrapping;
  rearbottomFloorTexture.repeat.set(0.03, 0.03);
  var rearbottomFloorMaterial = new THREE.MeshBasicMaterial( { map: rearbottomFloorTexture } );
  rearbottomFloorMaterial.side=THREE.DoubleSide;
  var rearbottomFloorMesh=new THREE.Mesh(rearbottomFloor,rearbottomFloorMaterial);
  scene.add(rearbottomFloorMesh);
  thingToStandOn.push(rearbottomFloorMesh);
  
  
  var firstRearRectFloor=new THREE.Geometry();
  firstRearRectFloor.vertices.push(
    new THREE.Vector3(187.5,625,187.5),
    new THREE.Vector3(187.5,625,-187.5),//0
    new THREE.Vector3(-187.5,625,-187.5),//1
    new THREE.Vector3(-187.5,625,187.5),
    new THREE.Vector3(112.5,625,-112.5),
    new THREE.Vector3(112.5,625,112.5),
    new THREE.Vector3(-112.5,625,112.5),
    new THREE.Vector3(-112.5,625,-112.5)
  );
  firstRearRectFloor.faces.push(
    new THREE.Face3(7,4,1),
    new THREE.Face3(1,2,7),
    new THREE.Face3(1,0,4),
    new THREE.Face3(4,5,0),
    new THREE.Face3(0,3,5),
    new THREE.Face3(5,3,6),
    new THREE.Face3(3,7,6),
    new THREE.Face3(3,7,2)
  );
  // console.log(firstRearRectFloor);
  firstRearRectFloor.computeFaceNormals();
  firstRearRectFloor.computeVertexNormals();
  assignUVs(firstRearRectFloor);
  var firstRearRectFloorTexture = new THREE.TextureLoader().load( "wood3.jpg" );
  firstRearRectFloorTexture.wrapS = firstRearRectFloorTexture.wrapT = THREE.MirroredRepeatWrapping;
  firstRearRectFloorTexture.repeat.set(0.03, 0.03);
  var firstRearRectFloorMaterial = new THREE.MeshBasicMaterial( { map: firstRearRectFloorTexture } );
  firstRearRectFloorMaterial.side=THREE.DoubleSide;
  var firstRearRectFloorMesh=new THREE.Mesh(firstRearRectFloor,firstRearRectFloorMaterial);
  scene.add(firstRearRectFloorMesh);
  thingToStandOn.push(firstRearRectFloorMesh);
  
  var secondFloorRearRect=new THREE.Geometry();
  
  secondFloorRearRect.vertices.push(
    new THREE.Vector3(187.5,475,187.5),//0
    new THREE.Vector3(187.5,475,-187.5),//1
    new THREE.Vector3(-187.5,475,-187.5),//4 2
    new THREE.Vector3(-187.5,475,187.5),//5 3
    new THREE.Vector3(-104.6226,475,-39.1312), //8 4
    new THREE.Vector3(-25.429,475,-39.1312),//9 5
    new THREE.Vector3(0,475,-114.1312),//10 6
    new THREE.Vector3(25.429,475,-39.1312),//11 7
    new THREE.Vector3(104.6226,475,-39.1312),//12 8
    new THREE.Vector3(41.145,475,9.2376),//13 9
    new THREE.Vector3(64.6557,475,84.8598),//14 10
    new THREE.Vector3(0,475,39.1312),//15 11
    new THREE.Vector3(-64.6557,475,84.8598),//16 12
    new THREE.Vector3(-41.145,475,9.2376),//17 13
    new THREE.Vector3(187.5,475,9.2376),//18 14
    new THREE.Vector3(0,475,187.5),//19 15
    new THREE.Vector3(-187.5,475,9.2376)//20 16
    
  );
  
  secondFloorRearRect.faces.push(
    new THREE.Face3(2,4,5),
    new THREE.Face3(2,5,6),
    new THREE.Face3(2,6,1),
    new THREE.Face3(6,1,7),
    new THREE.Face3(7,1,8),
    new THREE.Face3(1,8,14),
    new THREE.Face3(9,8,14),
    new THREE.Face3(9,14,10),
    new THREE.Face3(14,10,0),//prob ?
    new THREE.Face3(10,15,0),
    new THREE.Face3(10,11,15),
    new THREE.Face3(11,12,15),
    new THREE.Face3(12,15,3),
    new THREE.Face3(12,3,16),
    new THREE.Face3(12,13,16),
    new THREE.Face3(4,13,16),
    new THREE.Face3(4,2,16)
  );
  
  secondFloorRearRect.computeFaceNormals();
  secondFloorRearRect.computeVertexNormals();
  assignUVs(secondFloorRearRect);
  var secondFloorRearRectTexture = new THREE.TextureLoader().load( "wood3.jpg" );
  secondFloorRearRectTexture.wrapS = secondFloorRearRectTexture.wrapT = THREE.MirroredRepeatWrapping;
  secondFloorRearRectTexture.repeat.set(0.03, 0.03);
  var secondFloorRearRectMaterial = new THREE.MeshBasicMaterial( { map: secondFloorRearRectTexture } );
  secondFloorRearRectMaterial.side=THREE.DoubleSide;
  var secondFloorRearRectMesh=new THREE.Mesh(secondFloorRearRect,secondFloorRearRectMaterial);
  scene.add(secondFloorRearRectMesh);
  thingToStandOn.push(secondFloorRearRectMesh);
  
  // controls.getObject().position.y=325;
  
  var sideRect2=new THREE.BoxGeometry( 375, 1200, 375 );
  sideRect2.rotateY(Math.PI/4);
  sideRect2.translate(275,0,250);
  
  sideRect2.vertices.push(
    //sideRect2.1
    new THREE.Vector3(372.227,425,417.938),//8
    new THREE.Vector3(442.938,425,347.227),//9
    new THREE.Vector3(372.227,560,417.938),//10
    new THREE.Vector3(442.938,560,347.227),//11
    new THREE.Vector3(395.774,575,394.391),//12
    new THREE.Vector3(419.391,575,370.774), //13
    //sideRect2.2
    new THREE.Vector3(372.227,120,82.062),// 14
    new THREE.Vector3(442.938,120,152.773),// 15
    new THREE.Vector3(395.775,100,105.609),// 16
    new THREE.Vector3(419.391,100,129.226),// 17
    new THREE.Vector3(372.227,230,82.062),// 18
    new THREE.Vector3(442.938,230,152.773),// 19
    new THREE.Vector3(395.775,250,105.609),// 20
    new THREE.Vector3(419.391,250,129.226),// 21
    //door
    new THREE.Vector3(304,0,489.165),//22
    new THREE.Vector3(304,112.5,489.165),//23
    new THREE.Vector3(328,150,462.165),//24
    new THREE.Vector3(352,150,438.165),//25
    new THREE.Vector3(376,112.5,414.165),//26
    new THREE.Vector3(376,0,414.165),//27
    //hallways front
    new THREE.Vector3(148.5,300,388.66504),//28
    new THREE.Vector3(148.5,350,388.66504),//29
    new THREE.Vector3(129.917,375,370.82),//30//point at top of door
    new THREE.Vector3(111.33496,350,351.5),//31
    new THREE.Vector3(111.33496,300,351.5),//32
    
    new THREE.Vector3(148.5,0,388.66504),//33
    new THREE.Vector3(148.5,50,388.66504),//34
    new THREE.Vector3(129.917,75,370.82),//35//point at top of door
    new THREE.Vector3(111.33496,50,351.5),//36
    new THREE.Vector3(111.33496,0,351.5),//37
    //hallways back
    new THREE.Vector3(148.5,0,111.33496),//38
    new THREE.Vector3(148.5,50,111.33496),//39
    new THREE.Vector3(129.917,75,129.918),//40//point at top of door
    new THREE.Vector3(111.33496,50,148.5),//41
    new THREE.Vector3(111.33496,0,148.5),//42
    
    new THREE.Vector3(148.5,300,111.33496),//43
    new THREE.Vector3(148.5,350,111.33496),//44
    new THREE.Vector3(129.917,375,129.918),//45//point at top of door
    new THREE.Vector3(111.33496,350,148.5),//46
    new THREE.Vector3(111.33496,300,148.5),//47
    
    new THREE.Vector3(148.5,475,111.33496),//48
    new THREE.Vector3(148.5,525,111.33496),//49
    new THREE.Vector3(129.917,550,129.918),//50//point at top of door
    new THREE.Vector3(111.33496,525,148.5),//51
    new THREE.Vector3(111.33496,475,148.5),//52
  );

  sideRect2.faces=[];
  sideRect2.faces.push(
  // new THREE.Face3(4,6,5),
  // new THREE.Face3(6,7,5),
  // new THREE.Face3(4,5,1),
  // new THREE.Face3(5,0,1),
  new THREE.Face3(7,6,2),
  new THREE.Face3(6,3,2),
  // new THREE.Face3(1,3,4),
  // new THREE.Face3(3,6,4),
  //side2.1
  new THREE.Face3(8,5,10),
  new THREE.Face3(5,10,12),
  new THREE.Face3(5,12,13),
  new THREE.Face3(5,13,0),
  new THREE.Face3(0,13,11),
  new THREE.Face3(0,11,9),
  new THREE.Face3(7,23,22),
  new THREE.Face3(7,23,5),
  new THREE.Face3(23,5,24),
  new THREE.Face3(24,5,8),
  new THREE.Face3(24,8,25),
  new THREE.Face3(25,8,9),
  new THREE.Face3(26,9,0),
  new THREE.Face3(9,25,26),
  new THREE.Face3(26,2,0),
  new THREE.Face3(27,26,2),
  
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
  new THREE.Face3(14,1,3),
  //hallway
  new THREE.Face3(32,4,31),
  new THREE.Face3(31,4,30),
  new THREE.Face3(4,30,5),
  new THREE.Face3(5,30,29),
  new THREE.Face3(5,29,28),
  new THREE.Face3(5,35,28),
  new THREE.Face3(32,28,35),
  new THREE.Face3(5,35,34),
  new THREE.Face3(5,34,7),
  new THREE.Face3(34,7,33),
  new THREE.Face3(33,7,6),
  new THREE.Face3(37,33,6),
  new THREE.Face3(37,6,36),
  new THREE.Face3(36,6,4),
  new THREE.Face3(35,36,4),
  new THREE.Face3(35,4,32),
  
  new THREE.Face3(52,51,4),
  new THREE.Face3(51,50,4),
  new THREE.Face3(4,50,1),
  new THREE.Face3(50,49,1),
  new THREE.Face3(49,39,1),
  new THREE.Face3(1,39,3),
  new THREE.Face3(39,38,3),
  new THREE.Face3(38,3,6),
  new THREE.Face3(42,38,6),
  new THREE.Face3(41,42,6),
  new THREE.Face3(41,6,52),
  new THREE.Face3(6,52,4),
  new THREE.Face3(47,40,41),
  new THREE.Face3(47,40,43),
  new THREE.Face3(40,43,39),
  new THREE.Face3(46,52,45),
  new THREE.Face3(52,45,48),
  new THREE.Face3(45,48,44)
  
);
  // controls.getObject().position.y=325;
  var sideRect2Mesh=new THREE.Mesh(sideRect2,mazeContainerMaterial);
  sideRect2Mesh.geometry.computeFaceNormals();
  sideRect2Mesh.geometry.computeVertexNormals();
  assignUVs(sideRect2Mesh.geometry);
  sideRect2Mesh.updateMatrix(); 
  sideRect2Mesh.geometry.applyMatrix( sideRect2Mesh.matrix );
  sideRect2Mesh.matrix.identity();
  // makeStatic3dCubeorRect(sideRect2Mesh);
  // console.log("siderect2",sideRect2);
  scene.add(sideRect2Mesh);
  thingsToCollideWith.push(sideRect2Mesh);
  // meshs.push(sideRect2Mesh);
  
  //siderect2 floor and roof
  
  var sideRect2Roof=new THREE.Geometry();
  sideRect2Roof.vertices.push(
    new THREE.Vector3(187.5,600,72.33496),//0
    new THREE.Vector3(187.5,600,187.5),//1
    new THREE.Vector3(72.33496,600,187.5),//2
    new THREE.Vector3(9.8349571,600,250),//3
    new THREE.Vector3(72.33496,600,312.5),//4
    new THREE.Vector3(187.5,600,312.5),//5
    new THREE.Vector3(187.5,600,427.66504),//6
    new THREE.Vector3(275,600,515.16504),//7
    new THREE.Vector3(540.16504,600,250),//8
    new THREE.Vector3(275,600,-15.16504)//9
  );
  
  sideRect2Roof=makeFloorsSide2(sideRect2Roof,new THREE.Vector3(275,600,250));

  sideRect2Roof.computeFaceNormals();
  sideRect2Roof.computeVertexNormals();
  assignUVs(sideRect2Roof);
  var sideRect2RoofMesh=new THREE.Mesh(sideRect2Roof,mazeContainerMaterial);
  scene.add(sideRect2RoofMesh);
  thingToStandOn.push(sideRect2RoofMesh);
  
  var siderect2floor1=new THREE.Geometry();
  siderect2floor1.vertices.push(
    new THREE.Vector3(187.5,300,72.33496),//0
    new THREE.Vector3(187.5,300,187.5),//1
    new THREE.Vector3(72.33496,300,187.5),//2
    new THREE.Vector3(9.8349571,300,250),//3
    new THREE.Vector3(72.33496,300,312.5),//4
    new THREE.Vector3(187.5,300,312.5),//5
    new THREE.Vector3(187.5,300,427.66504),//6
    new THREE.Vector3(275,300,515.16504),//7
    new THREE.Vector3(540.16504,300,250),//8
    new THREE.Vector3(275,300,-15.16504)//9
    
  );
  siderect2floor1=makeFloorsSide2(siderect2floor1,new THREE.Vector3(275,300,250))
  
  siderect2floor1.computeFaceNormals();
  siderect2floor1.computeVertexNormals();
  assignUVs(siderect2floor1);
  var siderect2floor1Texture = new THREE.TextureLoader().load( "wood3.jpg" );
  siderect2floor1Texture.wrapS = siderect2floor1Texture.wrapT = THREE.MirroredRepeatWrapping;
  siderect2floor1Texture.repeat.set(0.03, 0.03);
  var siderect2floor1Material = new THREE.MeshBasicMaterial( { map: siderect2floor1Texture } );
  siderect2floor1Material.side=THREE.DoubleSide;
  var siderect2floor1Mesh=new THREE.Mesh(siderect2floor1,siderect2floor1Material);
  scene.add(siderect2floor1Mesh);
  thingToStandOn.push(siderect2floor1Mesh);
  
  makeSpiralStairs(new THREE.Vector3(275,0,250),200,6);
  makeGazeboTop(sideRect2Roof.vertices,120,new THREE.Vector3(274,780,250),mazeContainerMaterial,2);


  var sideRect1=new THREE.BoxGeometry( 375, 1200, 375 );
  sideRect1.rotateY((Math.PI/4));
  sideRect1.translate(-275,0,250);
  
  sideRect1.vertices.push(
    // sideRect1.1
    new THREE.Vector3(-372.227,425,417.938),//8
    new THREE.Vector3(-442.938,425,347.227),//9
    new THREE.Vector3(-372.227,560,417.938),//10
    new THREE.Vector3(-442.938,560,347.227),//11
    new THREE.Vector3(-395.774,575,394.391),//12
    new THREE.Vector3(-419.391,575,370.774), //13
    //sideRect2.2
    new THREE.Vector3(-372.227,120,82.062),// 14
    new THREE.Vector3(-442.938,120,152.773),// 15
    new THREE.Vector3(-395.775,100,105.609),// 16
    new THREE.Vector3(-419.391,100,129.226),// 17
    new THREE.Vector3(-372.227,230,82.062),// 18
    new THREE.Vector3(-442.938,230,152.773),// 19
    new THREE.Vector3(-395.775,250,105.609),// 20
    new THREE.Vector3(-419.391,250,129.226),// 21
    //door
    new THREE.Vector3(-304,0,486.165),//22
    new THREE.Vector3(-304,112.5,486.165),//23
    new THREE.Vector3(-328,150,462.165),//24
    new THREE.Vector3(-352,150,438.165),//25
    new THREE.Vector3(-376,112.5,414.165),//26
    new THREE.Vector3(-376,0,414.165),//27
    //front hallways
    new THREE.Vector3(-148.5,300,388.66504),// 28
    new THREE.Vector3(-148.5,350,388.66504),// 29
    new THREE.Vector3(-129.917,375,370.82),//point at top of door 30
    new THREE.Vector3(-111.33496,350,351.5),// 31
    new THREE.Vector3(-111.33496,300,351.5),// 32
    
    new THREE.Vector3(-148.5,0,388.66504),// 33
    new THREE.Vector3(-148.5,50,388.66504),// 34
    new THREE.Vector3(-129.917,75,370.82),//point at top of door 35
    new THREE.Vector3(-111.33496,50,351.5),// 36
    new THREE.Vector3(-111.33496,0,351.5),// 37
    //back hallways
    new THREE.Vector3(-148.5,0,111.33496),// 38
    new THREE.Vector3(-148.5,50,111.33496),// 39
    new THREE.Vector3(-129.917,75,129.918),//point at top of door 40
    new THREE.Vector3(-111.33496,50,148.5),// 41
    new THREE.Vector3(-111.33496,0,148.5),// 42
    
    new THREE.Vector3(-148.5,300,111.33496),// 43
    new THREE.Vector3(-148.5,350,111.33496),// 44
    new THREE.Vector3(-129.917,375,129.918),//point at top of door 45
    new THREE.Vector3(-111.33496,350,148.5),// 46
    new THREE.Vector3(-111.33496,300,148.5),// 47
    
    new THREE.Vector3(-148.5,475,111.33496),// 48
    new THREE.Vector3(-148.5,525,111.33496),// 49
    new THREE.Vector3(-129.917,550,129.918),//point at top of door 50
    new THREE.Vector3(-111.33496,525,148.5),// 51
    new THREE.Vector3(-111.33496,475,148.5)// 52
    
  );

  sideRect1.faces=[];
  sideRect1.faces.push(
    // new THREE.Face3(4,5,1),
    // new THREE.Face3(5,0,1),
    new THREE.Face3(7,6,2),
    new THREE.Face3(6,3,2),
    
    //side1.1
    new THREE.Face3(5,8,10),
    new THREE.Face3(5,10,12),
    new THREE.Face3(5,12,4),
    new THREE.Face3(4,13,12),
    new THREE.Face3(4,13,11),
    new THREE.Face3(4,11,9),
    new THREE.Face3(7,22,23),
    new THREE.Face3(7,5,23),
    new THREE.Face3(26,6,27),
    new THREE.Face3(23,24,5),
    new THREE.Face3(8,24,25),
    new THREE.Face3(8,25,9),
    new THREE.Face3(5,24,8),
    new THREE.Face3(26,6,4),
    new THREE.Face3(25,26,9),
    new THREE.Face3(4,26,9),
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
    new THREE.Face3(14,1,3),
    //front hallway
    new THREE.Face3(33,34,7),
    new THREE.Face3(34,7,5),
    new THREE.Face3(28,5,29),
    new THREE.Face3(34,35,5),
    new THREE.Face3(30,29,5),
    new THREE.Face3(5,30,0),
    new THREE.Face3(5,28,35),
    new THREE.Face3(0,30,31),
    new THREE.Face3(0,31,32),
    new THREE.Face3(28,32,35),
    new THREE.Face3(0,32,35),
    new THREE.Face3(0,35,36),
    new THREE.Face3(0,36,2),
    new THREE.Face3(36,2,37),
    new THREE.Face3(2,37,7),
    //back hallway
    new THREE.Face3(48,49,1),
    new THREE.Face3(49,50,1),
    new THREE.Face3(50,1,0),
    new THREE.Face3(50,0,51),
    new THREE.Face3(51,0,52),
    new THREE.Face3(52,41,0),
    new THREE.Face3(41,0,2),
    new THREE.Face3(41,42,2),
    new THREE.Face3(42,2,3),
    new THREE.Face3(42,3,38),
    new THREE.Face3(38,39,3),
    new THREE.Face3(39,3,48),
    new THREE.Face3(48,1,3),
    new THREE.Face3(48,44,45),
    new THREE.Face3(48,45,52),
    new THREE.Face3(45,52,46),
    new THREE.Face3(39,43,40),
    new THREE.Face3(43,40,47),
    new THREE.Face3(40,47,41)
  );
  
  var sideRect1Mesh=new THREE.Mesh(sideRect1,mazeContainerMaterial);
  sideRect1Mesh.geometry.computeFaceNormals();
  sideRect1Mesh.geometry.computeVertexNormals();
  assignUVs(sideRect1Mesh.geometry);
  sideRect1Mesh.updateMatrix(); 
  sideRect1Mesh.geometry.applyMatrix( sideRect1Mesh.matrix );
  sideRect1Mesh.matrix.identity();
  // makeStatic3dCubeorRect(sideRect1Mesh);
  scene.add(sideRect1Mesh);
  thingsToCollideWith.push(sideRect1Mesh);
  // meshs.push(sideRect1Mesh);
  
  
  
  //side1 floors and roof  
  var sideRect1Roof=new THREE.Geometry();
  sideRect1Roof.vertices.push(
    new THREE.Vector3(-187.5,600,72.33496),//0
    new THREE.Vector3(-187.5,600,187.5),//1
    new THREE.Vector3(-72.33496,600,187.5),//2
    new THREE.Vector3(-9.8349571,600,250),//3
    new THREE.Vector3(-72.33496,600,312.5),//4
    new THREE.Vector3(-187.5,600,312.5),//5
    new THREE.Vector3(-187.5,600,427.66504),//6
    new THREE.Vector3(-275,600,515.16504),//7
    new THREE.Vector3(-540.16504,600,250),//8
    new THREE.Vector3(-275,600,-15.16504)//9
  );
  
  sideRect1Roof=makeFloorsSide1(sideRect1Roof,new THREE.Vector3(-275,600,250));
  console.log("hello",sideRect1Roof);
  sideRect1Roof.computeFaceNormals();
  sideRect1Roof.computeVertexNormals();
  assignUVs(sideRect1Roof);
  var sideRect1RoofMesh=new THREE.Mesh(sideRect1Roof,mazeContainerMaterial);
  scene.add(sideRect1RoofMesh);
  thingToStandOn.push(sideRect1RoofMesh);
  
  var siderect1floor1=new THREE.Geometry();
  siderect1floor1.vertices.push(
    new THREE.Vector3(-187.5,300,72.33496),//0
    new THREE.Vector3(-187.5,300,187.5),//1
    new THREE.Vector3(-72.33496,300,187.5),//2
    new THREE.Vector3(-9.8349571,300,250),//3
    new THREE.Vector3(-72.33496,300,312.5),//4
    new THREE.Vector3(-187.5,300,312.5),//5
    new THREE.Vector3(-187.5,300,427.66504),//6
    new THREE.Vector3(-275,300,515.16504),//7
    new THREE.Vector3(-540.16504,300,250),//8
    new THREE.Vector3(-275,300,-15.16504)//9
  );
  siderect1floor1=makeFloorsSide1(siderect1floor1,new THREE.Vector3(-274,300,250));
  
  
  siderect1floor1.computeFaceNormals();
  siderect1floor1.computeVertexNormals();
  assignUVs(siderect1floor1);
  var siderect1floor1Texture = new THREE.TextureLoader().load( "wood3.jpg" );
  siderect1floor1Texture.wrapS = siderect1floor1Texture.wrapT = THREE.MirroredRepeatWrapping;
  siderect1floor1Texture.repeat.set(0.03, 0.03);
  var siderect1floor1Material = new THREE.MeshBasicMaterial( { map: siderect1floor1Texture } );
  siderect1floor1Material.side=THREE.DoubleSide;
  var siderect1floor1Mesh=new THREE.Mesh(siderect1floor1,siderect1floor1Material);
  scene.add(siderect1floor1Mesh);
  thingToStandOn.push(siderect1floor1Mesh);
  
  makeSpiralStairs(new THREE.Vector3(-275,0,250),200,6);
  makeGazeboTop(sideRect1Roof.vertices,120,new THREE.Vector3(-274,780,250),mazeContainerMaterial,1);
  

}

function makeGazeboTop(vertices,heightOfWalls,centerPoint,material,side){
  var top=new THREE.Geometry();
  top.vertices=vertices;
  var size=vertices.length;
  // console.log(*vertices);
  // console.log(top.vertices.length);
  for(var i=10;i<size;i++){
    // console.log("here");
    top.vertices.push(new THREE.Vector3(vertices[i].x,vertices[i].y+heightOfWalls,vertices[i].z));//starting at 30 [10] and [300] should be same point just offset on y axis
    // top.vertices.push(new THREE.Vector3(0,0,0));//starting at 30 [10] and [300] should be same point just offset on y axis
    // console.log(vertices.length);
    // console.log(top.vertices.length);
    // console.log(size);
  }
  top.vertices.push(centerPoint);
  // console.log(top);
  if(side==1){
  top.faces.push(
    // new THREE.Face3(10,11,30),
    // new THREE.Face3(30,11,31),
    // new THREE.Face3(11,12,31),
    // new THREE.Face3(31,32,12),
    new THREE.Face3(12,13,33),
    new THREE.Face3(32,33,12),
    new THREE.Face3(13,14,34),
    new THREE.Face3(33,34,13),
    new THREE.Face3(14,15,35),
    new THREE.Face3(34,35,14),
    new THREE.Face3(15,16,36),
    new THREE.Face3(35,36,15),
    new THREE.Face3(16,17,37),
    new THREE.Face3(36,37,16),
    new THREE.Face3(17,18,38),
    new THREE.Face3(37,38,17),
    new THREE.Face3(18,19,39),
    new THREE.Face3(38,39,18),
    new THREE.Face3(19,20,40),
    new THREE.Face3(39,40,19),
    new THREE.Face3(20,21,41),
    new THREE.Face3(40,41,20),
    new THREE.Face3(21,22,42),
    new THREE.Face3(41,42,21),
    new THREE.Face3(22,23,43),
    new THREE.Face3(42,43,22),
    new THREE.Face3(23,24,44),
    new THREE.Face3(43,44,23),
    new THREE.Face3(24,25,45),
    new THREE.Face3(44,45,24),
    new THREE.Face3(25,26,46),
    new THREE.Face3(45,46,25),
    new THREE.Face3(26,27,47),
    new THREE.Face3(46,47,26),
    new THREE.Face3(27,28,48),
    new THREE.Face3(47,48,27),
    new THREE.Face3(28,29,49),
    new THREE.Face3(48,49,28),
  );
}else if(side==2){
  top.faces.push(
    new THREE.Face3(10,11,30),
    new THREE.Face3(30,11,31),
    new THREE.Face3(11,12,31),
    new THREE.Face3(31,32,12),
    new THREE.Face3(12,13,33),
    new THREE.Face3(32,33,12),
    new THREE.Face3(13,14,34),
    new THREE.Face3(33,34,13),
    new THREE.Face3(14,15,35),
    new THREE.Face3(34,35,14),
    new THREE.Face3(15,16,36),
    new THREE.Face3(35,36,15),
    new THREE.Face3(16,17,37),
    new THREE.Face3(36,37,16),
    new THREE.Face3(17,18,38),
    new THREE.Face3(37,38,17),
    new THREE.Face3(18,19,39),
    new THREE.Face3(38,39,18),
    // new THREE.Face3(19,20,40),
    // new THREE.Face3(39,40,19),
    // new THREE.Face3(20,21,41),
    // new THREE.Face3(40,41,20),
    // new THREE.Face3(21,22,42),
    // new THREE.Face3(41,42,21),
    new THREE.Face3(22,23,43),
    new THREE.Face3(42,43,22),
    new THREE.Face3(23,24,44),
    new THREE.Face3(43,44,23),
    new THREE.Face3(24,25,45),
    new THREE.Face3(44,45,24),
    new THREE.Face3(25,26,46),
    new THREE.Face3(45,46,25),
    new THREE.Face3(26,27,47),
    new THREE.Face3(46,47,26),
    new THREE.Face3(27,28,48),
    new THREE.Face3(47,48,27),
    new THREE.Face3(28,29,49),
    new THREE.Face3(48,49,28),
    new THREE.Face3(29,10,30),
    new THREE.Face3(30,29,49),
  );
}
  top.computeFaceNormals();
  top.computeVertexNormals();
  assignUVs(top);
  var topMesh=new THREE.Mesh(top,material);
  scene.add(topMesh);
  thingToStandOn.push(topMesh);
  
  var roof=new THREE.Geometry();
  roof.vertices=top.vertices;
  for(var i=30;i<vertices.length-2;i++){
    roof.faces.push(new THREE.Face3(i,i+1,50));
  }
  roof.faces.push(new THREE.Face3(49,30,50));
  roof.computeFaceNormals();
  roof.computeVertexNormals();
  assignUVs(roof);
  var roofTexture = new THREE.TextureLoader().load( "wood3.jpg" );
  roofTexture.wrapS = roofTexture.wrapT = THREE.MirroredRepeatWrapping;
  roofTexture.repeat.set(0.03, 0.03);
  var roofMaterial = new THREE.MeshBasicMaterial( { map: roofTexture } );
  roofMaterial.side=THREE.DoubleSide;
  var roofMesh=new THREE.Mesh(roof,roofMaterial);
  scene.add(roofMesh);
  thingToStandOn.push(roofMesh);
  console.log("roof",roof);
}

function makeFloorsSide2(floor,centerPoint){
  // var floor=new THREE.Geometry();
  floor.vertices.push(
    new THREE.Vector3(centerPoint.x-60,centerPoint.y,centerPoint.z+9.503066419),//10
    new THREE.Vector3(centerPoint.x-60,centerPoint.y,centerPoint.z-9.503066419)//11
  );
  
  for(var i=1;i<19;i++){
    var radians=(18*i+9)*(Math.PI/180);
    var newx=Math.cos(radians)*60.74790755;
    var newz=-(Math.sin(radians)*60.74790755);
    
    floor.vertices.push(new THREE.Vector3(centerPoint.x-newx,centerPoint.y,centerPoint.z+newz));
    
  }
  floor.faces.push(
    new THREE.Face3(10,29,4),
    new THREE.Face3(10,11,4),
    new THREE.Face3(3,11,4),
    new THREE.Face3(3,2,1),
    new THREE.Face3(3,1,11),
    new THREE.Face3(1,12,11),
    new THREE.Face3(13,12,1),
    new THREE.Face3(0,1,13),
    new THREE.Face3(14,0,13),
    new THREE.Face3(15,14,0),
    new THREE.Face3(9,0,15),
    new THREE.Face3(9,16,15),
    new THREE.Face3(9,16,17),
    new THREE.Face3(9,17,18),
    new THREE.Face3(9,18,19),
    new THREE.Face3(8,20,19),
    new THREE.Face3(8,9,19),
    new THREE.Face3(8,21,20),
    new THREE.Face3(8,21,22),
    new THREE.Face3(8,22,23),
    new THREE.Face3(8,23,24),
    new THREE.Face3(8,24,25),
    new THREE.Face3(7,25,26),
    new THREE.Face3(8,7,25),
    new THREE.Face3(7,26,27),
    new THREE.Face3(6,27,28),
    new THREE.Face3(6,28,29),
    new THREE.Face3(27,7,6),
    new THREE.Face3(6,4,29)
    
  );
  return floor;
  
}

function makeFloorsSide1(floor,centerPoint){
  // var floor=new THREE.Geometry();
  floor.vertices.push(
    new THREE.Vector3(centerPoint.x+60,centerPoint.y,centerPoint.z+9.503066419),//10
    new THREE.Vector3(centerPoint.x+60,centerPoint.y,centerPoint.z-9.503066419)//11
  );
  
  for(var i=1;i<19;i++){
    var radians=(18*i+9)*(Math.PI/180);
    var newx=Math.cos(radians)*60.74790755;
    var newz=-(Math.sin(radians)*60.74790755);
    
    floor.vertices.push(new THREE.Vector3(centerPoint.x+newx,centerPoint.y,centerPoint.z+newz));
    
  }
  floor.faces.push(
    new THREE.Face3(10,29,4),
    new THREE.Face3(10,11,4),
    new THREE.Face3(3,11,4),
    new THREE.Face3(3,2,1),
    new THREE.Face3(3,1,11),
    new THREE.Face3(1,12,11),
    new THREE.Face3(13,12,1),
    new THREE.Face3(0,1,13),
    new THREE.Face3(14,0,13),
    new THREE.Face3(15,14,0),
    new THREE.Face3(9,0,15),
    new THREE.Face3(9,16,15),
    new THREE.Face3(9,16,17),
    new THREE.Face3(9,17,18),
    new THREE.Face3(9,18,19),
    new THREE.Face3(8,20,19),
    new THREE.Face3(8,9,19),
    new THREE.Face3(8,21,20),
    new THREE.Face3(8,21,22),
    new THREE.Face3(8,22,23),
    new THREE.Face3(8,23,24),
    new THREE.Face3(8,24,25),
    new THREE.Face3(7,25,26),
    new THREE.Face3(8,7,25),
    new THREE.Face3(7,26,27),
    new THREE.Face3(6,27,28),
    new THREE.Face3(6,28,29),
    new THREE.Face3(27,7,6),
    new THREE.Face3(6,4,29)
    
  );
  return floor;
  
}

function makeSpiralStairs(centerPoint,numberOfStairs,landingSize){
  var stairCase=new THREE.Geometry();
  stairCase.vertices.push(
    //top triangle
    new THREE.Vector3(centerPoint.x,centerPoint.y+3,centerPoint.z),//0
    new THREE.Vector3(centerPoint.x+60,centerPoint.y+3,centerPoint.z-9.503066419),//1
    new THREE.Vector3(centerPoint.x+60,centerPoint.y+3,centerPoint.z+9.503066419),//2
    //bottom triangle
    new THREE.Vector3(centerPoint.x,centerPoint.y,centerPoint.z),//3
    new THREE.Vector3(centerPoint.x+60,centerPoint.y,centerPoint.z-9.503066419),//4
    new THREE.Vector3(centerPoint.x+60,centerPoint.y,centerPoint.z+9.503066419),//5
  );
  
  stairCase.faces.push(
    new THREE.Face3(0,1,2),
    new THREE.Face3(3,4,5),
    new THREE.Face3(0,3,5),
    new THREE.Face3(0,5,2),
    new THREE.Face3(0,4,3),
    new THREE.Face3(0,4,1),
    new THREE.Face3(1,2,5),
    new THREE.Face3(5,4,1)
  );
  
  var updatesharedPoint=stairCase.vertices[1];//prev top triangle makes it bottom for next triangle
  var updatecenterPoint=stairCase.vertices[0];//prev top triangle makes it bottom for next triangle
  
  for(var i=1;i<numberOfStairs;i++){
    // console.log(i);
    var radians=(18*i+9)*(Math.PI/180);
    var newx=Math.cos(radians)*60.74790755;
    var newz=-(Math.sin(radians)*60.74790755);
    
    // var geometry=new THREE.Geometry();
    stairCase.vertices.push(
      //top triangle
      new THREE.Vector3(updatecenterPoint.x,updatecenterPoint.y+3,updatecenterPoint.z),//0 centerPoint
      new THREE.Vector3(centerPoint.x+newx,updatecenterPoint.y+3,centerPoint.z+newz),//1
      new THREE.Vector3(updatesharedPoint.x,updatesharedPoint.y+3,updatesharedPoint.z),//2
      //bottom triangle
      new THREE.Vector3(updatecenterPoint.x,updatecenterPoint.y,updatecenterPoint.z),//3
      new THREE.Vector3(centerPoint.x+newx,updatecenterPoint.y,centerPoint.z+newz),//4
      new THREE.Vector3(updatesharedPoint.x,updatesharedPoint.y,updatesharedPoint.z),//5
    );
    
    stairCase.faces.push(
      new THREE.Face3(i*6,i*6+1,i*6+2),
      new THREE.Face3(i*6+3,i*6+4,i*6+5),
      new THREE.Face3(i*6,i*6+3,i*6+5),
      new THREE.Face3(i*6,i*6+5,i*6+2),
      new THREE.Face3(i*6,i*6+4,i*6+3),
      new THREE.Face3(i*6,i*6+4,i*6+1),
      new THREE.Face3(i*6+1,i*6+2,i*6+5),
      new THREE.Face3(i*6+5,i*6+4,i*6+1)
    );
    
    updatesharedPoint=stairCase.vertices[i*6+1];
    updatecenterPoint=stairCase.vertices[i*6];
    
    
  }
  //landing
  updatesharedPoint=stairCase.vertices[(numberOfStairs*6)-5];//top shared point;
  updatecenterPoint=stairCase.vertices[(numberOfStairs*6)-6]
  
  for(var i=0;i<landingSize;i++){
    var radians=(18*i+9)*(Math.PI/180);
    var newx=Math.cos(radians)*60.74790755;
    var newz=-(Math.sin(radians)*60.74790755);
    stairCase.vertices.push(
      //top triangle
      new THREE.Vector3(updatesharedPoint.x,updatesharedPoint.y,updatesharedPoint.z),
      new THREE.Vector3(updatecenterPoint.x,updatecenterPoint.y,updatecenterPoint.z),
      new THREE.Vector3(updatecenterPoint.x+newx,updatecenterPoint.y,updatecenterPoint.z+newz)
          );
    stairCase.faces.push(
      new THREE.Face3(((numberOfStairs*6)-1)+((i*3)+1),((numberOfStairs*6)-1)+((i*3)+2),((numberOfStairs*6)-1)+((i*3)+3))
    )
    updatesharedPoint=stairCase.vertices[((numberOfStairs*6)-1)+((i*3)+3)];
    updatecenterPoint=stairCase.vertices[((numberOfStairs*6)-1)+((i*3)+2)];
  }
  
  console.log(stairCase);
  stairCase.computeFaceNormals();
  stairCase.computeVertexNormals();
  assignUVs(stairCase);
  var stairCaseTexture = new THREE.TextureLoader().load( "wood3.jpg" );
  stairCaseTexture.wrapS = stairCaseTexture.wrapT = THREE.MirroredRepeatWrapping;
  stairCaseTexture.repeat.set(0.03, 0.03);
  var stairCaseMaterial = new THREE.MeshBasicMaterial( { map: stairCaseTexture } );// color:0xff0000Texture this texture is what was slowing it down
  stairCaseMaterial.side=THREE.DoubleSide;
  var stairCaseMesh=new THREE.Mesh(stairCase,stairCaseMaterial);
  scene.add(stairCaseMesh);
  thingToStandOn.push(stairCaseMesh);
  
}






// function addObjstoScene(){
//   for(i=0;i<meshs.length;i++){
//     scene.add(meshs[i]);
//   }
// }
// 
// function makeStatic3dCubeorRect(mesh){
//   // mesh.geometry.computeBoundingBox();
//   // var center=mesh.geometry.boundingBox.getCenter(new THREE.Vector3());
//   
//   var vector1=mesh.geometry.vertices[0];
//   var vector2=mesh.geometry.vertices[1];
//   var vector3=mesh.geometry.vertices[4];
//   var vector4=mesh.geometry.vertices[5];
//   verts=[vector1,vector2,vector3,vector4];
//   sides=makeSides(verts);
//   var object=new Static3dCubeorRect(mesh,sides);
//   castle.push(object);
// }
// 
// function makeSides(vertsIn){
//   sides=[];
//   for(i=0;i<vertsIn.length;i++){
//     var vert1;
//     var vert2;
//     if(i+1==vertsIn.length){
//       vert1=vertsIn[vertsIn.length-1];
//       vert2=vertsIn[0];
//     }else{
//       vert1=vertsIn[i];
//       vert2=vertsIn[i+1];
//     }
//     var side=new rectorsquareside(vert1,vert2);
//     sides.push(side);
//   }
//   // console.log(sides);
//   return sides;
// }
// //FINISH WRITING THIS METHOD AND MAKE SURE THAT MAKESIDES METHOD WORKS
// function isInsideBuilding(playerPos){
//   var triangleArea=0;
//   var isInside=false;
//   // playerPos=controls.getObject().position;
//   // console.log(playerPos);
//   for(i=0;i<castle.length;i++){
//     // rect=castle[i];
//     triangleArea=0;
//     for (j=0;j<castle[i].sides.length;j++){
//       side=castle[i].sides[j]
//       // rectSides=rect.sides;
//       // h=Math.sqrt((castle[i].sides[j].halfx-playerPos.x)**2 + (castle[i].sides[j].halfz-playerPos.z)**2);
//       // console.log(h);
// 
//       // b=arrayIn[i].sides[j].length
//       // area=.5*castle[i].sides[j].base*h
//       //PLAYERPOS is 1 VECT1 is 2 and VECT2 is 3
//       // var area=0;
//       var area=.5*(playerPos.x*(side.vert1.z-side.vert2.z) + side.vert1.x*(side.vert2.z-playerPos.z) + side.vert2.x*(playerPos.z-side.vert1.z));      
//       triangleArea=triangleArea+Math.abs(area);
//       
//     //   if (count%50==0){
//     //     console.log("Playerpos",playerPos)//,"vert1: ",side.vert1,"vert2: ",side.vert2,"\n");
//     //   }
//      }
//     // if (count%50==0){
//     //   console.log("Tirarea: ",triangleArea,"Squarearea: ",castle[i].area,"playerPos: ", playerPos, castle[i].mesh, "i: ",i);
//     //   // console.log(playerPos);
//     //   if(triangleArea==castle[i].area){
//     //     console.log("you are inside the box");
//     //     break;
//     //   }else{
//     //     console.log("you are outside the box");
//     //   }
//     // }
//     
//     if(Math.round(triangleArea)==castle[i].area){
//       // console.log("you are inside the box",triangleArea);
//       // break;
//       isInside=true;
//       return isInside;
//      }
//      //else{
//     //   // console.log("you are outside the box",triangleArea);
//     // }
//   }
// }


function isCollide(playerPos){
    for(var i=0;i<thingsToCollideWith.length;i++){
      var faces=thingsToCollideWith[i].geometry.faces;
      var vertices=thingsToCollideWith[i].geometry.vertices;
      
      for(var j=0;j<faces.length;j++){
        var point1=vertices[faces[j].a];
        var point2=vertices[faces[j].b];
        var point3=vertices[faces[j].c];
        // var edgeVectors=makeVectors(point1,point2,point3);
        
        //PLANECOEFFICIENTS IS ALSO THE NORMAL VECTOR FOR THE PLANE THE TRIANGLE EXISTS IN
        var planeCoefficients=math.cross(makeVector(point1,point2),makeVector(point1,point3));//these need to be the vectors found from the points
        
        // TESTS TO SEE IF RAY IS PARALLEL TO THE COLLISION WALL
        var dirxRay=[playerPos.x+5-playerPos.x,playerPos.y-playerPos.y,playerPos.z-playerPos.z]
        var dirzRay=[playerPos.x-playerPos.x,playerPos.y-playerPos.y,playerPos.z+5-playerPos.z]
        var parallelz=Math.abs(math.dot(planeCoefficients,dirzRay));
        var parallelx=Math.abs(math.dot(planeCoefficients,dirxRay));
        
        
        // THIS THE NUMBER AFTER TAKING CARE OF ALL THE CONSTANT OPPERATIONS AND MOVING IT TO THE OTHER SIDE OF THE EQUATION FOR THE PLANE
        var constantCoefficient=-(planeCoefficients[0]*point1.x)-(planeCoefficients[1]*point1.y)-(planeCoefficients[2]*point1.z)
        planeCoefficients[3]=-constantCoefficient;
        
                
        var posxIntersect=math.intersect([playerPos.x,playerPos.y,playerPos.z],[playerPos.x+5,playerPos.y,playerPos.z],planeCoefficients);
        var poszIntersect=math.intersect([playerPos.x,playerPos.y,playerPos.z],[playerPos.x,playerPos.y,playerPos.z+5],planeCoefficients);
        
        // var posxdist=math.distance(posxIntersect,[playerPos.x,playerPos.y,playerPos.z]);
        // var poszdist=math.distance(poszIntersect,[playerPos.x,playerPos.y,playerPos.z]);
        // console.log("posxdist",posxdist,"poszdist",poszdist);
        
        // if(poszdist<=5||posxdist<=5){
        //   return true;
        // }
        
        //if point is inside triangular face then check its distance
        
        // if(parallelx<Number.EPSILON){
          
          var poszdist=math.distance(poszIntersect,[playerPos.x,playerPos.y,playerPos.z]);//I swaped the distance if with the isInsideTri if. if this cause problems which them back
          
          if(poszdist<=5){
            if(isInsideTri(point1,point2,point3,poszIntersect,planeCoefficients.slice(0,-1))){//point1,point2,point3,intersectionPoint,vectNorm
            // console.log("zdist",poszdist);
            return true;
          }
          
        }
        // }
        // if(parallelz<Number.EPSILON){
          
          var posxdist=math.distance(posxIntersect,[playerPos.x,playerPos.y,playerPos.z]);
          // console.log("xdist",posxdist);
          if(posxdist<=5){
            if(isInsideTri(point1,point2,point3,posxIntersect,planeCoefficients.slice(0,-1))){
            return true;
          }
          
        }
        // }
        
        
        // if(posxdist<=5){
        //   // console.log("constantCoefficient",constantCoefficient,"planeCoefficients",planeCoefficients,"vectors",vectors,"i",i,"j",j,point1,point2,point3,"x","posx",posxIntersect,"pp",playerPos);
        //   // console.log("x",isParallelx);
        //   // console.log("z",parallelz);
        //   if(parallelz<Number.EPSILON){
        //       console.log("collidingwithx");
        //     }
        //   return true;
        // }
        // if(poszdist<=5){
        //   // console.log("z",isParallelz);
        //   // console.log("x",parallelx);
        //   if(parallelx<Number.EPSILON){
        //       console.log("collidingwithz");
        //     }
        //   return true;
        // }
        
      }
      
    }
}

// function isInsideTri1(point1,point2,point3,playerPos){
//   var edge1=makeVector(point1,point2);
//   var arrowHelper = new THREE.ArrowHelper( new THREE.Vector3(edge1[0],edge1[1],edge1[2]).normalize(), point1, 100, 0x0061ff );//blue
//   scene.add( arrowHelper );
//   
//   var edge2=makeVector(point1,point3);
//   // var arrowHelper = new THREE.ArrowHelper( new THREE.Vector3(edge2[0],edge2[1],edge2[2]).normalize(), point1, 100, 0x04ff00 );//green
//   // scene.add( arrowHelper );
//   
//   var edge3=makeVector(point2,point3);
//   var arrowHelper = new THREE.ArrowHelper( new THREE.Vector3(edge3[0],edge3[1],edge3[2]).normalize(), point2, 100, 0xed1520 );//red
//   scene.add( arrowHelper );
//   
//   var edge4=makeVector(point2,point1);
//   // var arrowHelper = new THREE.ArrowHelper( new THREE.Vector3(edge4[0],edge4[1],edge4[2]).normalize(), point2, 100, 0xed1520 );//red
//   // scene.add( arrowHelper );
//   
//   var edge5=makeVector(point3,point2);
//   // var arrowHelper = new THREE.ArrowHelper( new THREE.Vector3(edge5[0],edge5[1],edge5[2]).normalize(), point3, 700, 0xed1520 );//red
//   // scene.add( arrowHelper );
//   
//   var c1=makeVector(point1,playerPos);//if need be switch the order in which these points and entered into the method
//   // var arrowHelper = new THREE.ArrowHelper( new THREE.Vector3(c1[0],c1[1],c1[2]).normalize(), point1, 100, 0x00efeb );//teal
//   // scene.add( arrowHelper );
//   
//   var c2=makeVector(point2,playerPos);
//   // var arrowHelper = new THREE.ArrowHelper( new THREE.Vector3(c2[0],c2[1],c2[2]).normalize(), point2, 100, 0xff5f02 );//orange
//   // scene.add( arrowHelper );
//   
//   var c3=makeVector(point3,playerPos);
//   // var arrowHelper = new THREE.ArrowHelper( new THREE.Vector3(c3[0],c3[1],c3[2]).normalize(), point3, 700, 0xf6ff00 );//yellow
//   // scene.add( arrowHelper );
//   
//   var c1len=Math.sqrt(Math.pow(c1[0],2)+Math.pow(c1[1],2)+Math.pow(c1[2],2));
//   var c2len=Math.sqrt(Math.pow(c2[0],2)+Math.pow(c2[1],2)+Math.pow(c2[2],2));
//   var c3len=Math.sqrt(Math.pow(c3[0],2)+Math.pow(c3[1],2)+Math.pow(c3[2],2));
//   
//   var edge1len=Math.sqrt(Math.pow(edge1[0],2)+Math.pow(edge1[1],2)+Math.pow(edge1[2],2));
//   var edge2len=Math.sqrt(Math.pow(edge2[0],2)+Math.pow(edge2[1],2)+Math.pow(edge2[2],2));
//   var edge3len=Math.sqrt(Math.pow(edge3[0],2)+Math.pow(edge3[1],2)+Math.pow(edge3[2],2));
//   var edge4len=Math.sqrt(Math.pow(edge4[0],2)+Math.pow(edge4[1],2)+Math.pow(edge4[2],2)); 
//   var edge5len=Math.sqrt(Math.pow(edge5[0],2)+Math.pow(edge5[1],2)+Math.pow(edge5[2],2)); 
//   
//   var dot=math.dot(edge1,c1);
//   var dot1=math.dot(edge3,c2);
//   var dot2=math.dot(edge5,c3);
//   var dot3=math.dot(edge1,edge2);
//   var dot4=math.dot(edge3,edge4);
//   // var dot5=math.dot(edge2,edge3);
//   // var dot6=math.dot(edge3,edge2);
//   var dot7=math.dot(edge1,edge3);
//   
//   var thetaEdge1C1=Math.acos( (dot) / (edge1len*c1len) )*180/Math.PI;
//   var thetaEdge3C2=Math.acos( (dot1) / (edge3len*c2len) )*180/Math.PI;
//   var thetaEdge5C3=Math.acos( (dot2) / (edge5len*c3len) )*180/Math.PI;
//   
//   var thetaVert1=Math.acos((dot3)/(edge1len*edge2len))*180/Math.PI;
//   var thetaVert2=Math.acos((dot4)/(edge3len*edge4len))*180/Math.PI;
//   var thetaVert3=180-(thetaVert1+thetaVert2);
//   // if(thetaVert1>thetaVert2){
//   //   thetaVert3=thetaVert1-thetaVert2;
//   // }else{
//   //   thetaVert3=thetaVert2-thetaVert1;
//   // }
//   
//   // console.log(thetaVert1,thetaVert2,thetaVert3,thetaEdge1C1,thetaEdge3C2,thetaEdge5C3);
//   
//   
//   // console.log(thetaEdge1C1,thetaEdge2C2,thetaEdge3C3,thetaEdge1Edge2,thetaEdge1Edge3);
//   var thetaE1E3=Math.acos( (dot7) / (edge1len*edge3len) )*180/Math.PI;
//   console.log(thetaE1E3);
//   
// }

function isInsideTri(point1,point2,point3,intersectionPoint,vectNorm){
  var vectIntersection=new THREE.Vector3(intersectionPoint[0],intersectionPoint[1],intersectionPoint[2]);
  var edge1=makeVector(point1,point2);
  var edge2=makeVector(point2,point3);
  var edge3=makeVector(point3,point1);
  var c1=makeVector(point1,vectIntersection);//if need be switch the order in which these points and entered into the method
  var c2=makeVector(point2,vectIntersection);
  var c3=makeVector(point3,vectIntersection);
  
  if(math.dot(vectNorm,math.cross(edge1,c1))>0&& 
  math.dot(vectNorm,math.cross(edge2,c2))>0&&
  math.dot(vectNorm,math.cross(edge3,c3))>0){
    return true;
  }
  
}

function makeVector(point1,point2){//point1,point2,point3
  var retArr=[];
  var vect1to2=[];
  vect1to2[0]=point2.x-point1.x;
  vect1to2[1]=point2.y-point1.y;
  vect1to2[2]=point2.z-point1.z;
  // retArr.push(vect1to2);
  
  // var vect1to3=[];
  // vect1to3[0]=point3.x-point1.x;
  // vect1to3[1]=point3.y-point1.y;
  // vect1to3[2]=point3.z-point1.z;
  // // console.log(retArr);
  // retArr.push(vect1to2,vect1to3);
  // 
  // var vect2to3=[];
  // vect2to3[0]=point3.x-point2.x;
  // vect2to3[1]=point3.y-point2.y;
  // vect2to3[2]=point3.z-point2.z;
  // // console.log(retArr);
  // retArr.push(vect1to2,vect2to3);
  
  return vect1to2;
}

function averagePoints(vector1,vector2){
  var retArr=[];
  var x1=vector1.x;
  var y1=vector1.y;
  var z1=vector1.z;
  
  var x2=vector2.x;
  var y2=vector2.y;
  var z2=vector2.z;
  
  if(x1>x2){
    retArr.push((x1+x2)/2);
  }else{
    retArr.push((x2+x1)/2);
  }
  if(y1>y2){
    retArr.push((y1+y2)/2);
  }else{
    retArr.push((y2+y1)/2);
  }
  if(z1>z2){
    retArr.push((z1+z2)/2);
  }else{
    retArr.push((z2+z1)/2);
  }
  return retArr;
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}


function animate() {
  
  requestAnimationFrame( animate );
  
  if ( controlsEnabled === true ) {
    // count++;
    
    // var playerPos=controls.getObject().position;
    var intersections;
    raycaster.ray.origin.copy( controls.getObject().position );
    raycaster.ray.origin.y -= 20; //this number needs to be five less than the numbers on 994 996 988 to eliminate the display bobbing
    // console.log(controls.getObject().position,raycaster.ray.origin);
    // console.log(raycaster.ray.origin);
    
    var time = performance.now();
    var delta = ( time - prevTime ) / 1000;
    
    //COLLISION FOR JUMP ON OBJECTS LOGIC
    raycaster.ray.direction.copy(new THREE.Vector3(0,-1,0));//negyray
    // raycaster.ray.direction.copy(camera.getWorldDirection(new THREE.Vector3()));
    intersections=raycaster.intersectObjects(thingToStandOn);
    var isyCollision=intersections.length>0;
    
    // velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
    
    if(isyCollision){
      controls.getObject().position.y=intersections[0].point.y+25;
      // console.log("instersection",intersections[0].point.y);
      // controls.getObject().position.y=intersections[0].point.y;
      velocity.y = Math.max( 0, velocity.y );
      // console.log("COLLISION");
      canJump=true;
    }
    if(!isyCollision){
      canJump=false;
      velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
    } 
    else{
      if(controls.getObject().position.y<intersections[0].point.y+25){
        velocity.y=0;
        controls.getObject().position.y=intersections[0].point.y+25;
      }
    }
     raycaster.ray.direction.copy(new THREE.Vector3(0,1,0));//posyray
     intersections=raycaster.intersectObjects(thingToStandOn);
     isyCollision=intersections.length>0;
     if(isyCollision){
       velocity.y=-velocity.y;
     }


      //COLLISION IN THE X AND Z DIRECTIONS 
      var isCollisionxz=isCollide(controls.getObject().position);
      direction.z = Number( moveForward ) - Number( moveBackward );
      direction.x = Number( moveLeft ) - Number( moveRight );
      direction.normalize(); // this ensures consistent movements in all directions
      // console.log("direction",direction);

      
        // This is the line that will allow for me to get the directional vector from the camera
        // console.log("world",camera.getWorldDirection(new THREE.Vector3()));
      
      if(direction.x==0&&direction.z==0){//works if commented out but im not sure if ill need these lines so dont delete
      // console.log("line1098");
      velocity.z=0;
      velocity.x=0;
      
      }
      
    
    //THIS WORKS AND DOES NOT JITTER
    if(isCollisionxz){
      var newpp=averagePoints(controls.getObject().position,beforeCollisionpp);
      controls.getObject().position.x=newpp[0];
      controls.getObject().position.y=newpp[1];
      controls.getObject().position.z=newpp[2];
    }else{
      beforeCollisionpp.x=controls.getObject().position.x;
      beforeCollisionpp.y=controls.getObject().position.y;
      beforeCollisionpp.z=controls.getObject().position.z;
    }
      velocity.z = -(direction.z * 4000.0 * delta);
      velocity.x = -(direction.x * 4000.0 * delta);
      
      // if(!isCollisionxz){
        controls.getObject().translateX( velocity.x * delta );
        controls.getObject().translateY( velocity.y * delta );
        controls.getObject().translateZ( velocity.z * delta );
        // console.log("final position",controls.getObject().position.y);
      // }
      
    // console.log("canJump",canJump,"onobject",onObject,"snapShotPlayerposY",snapShotPlayerposY,"controls.y",controls.getObject().position.y);
    prevTime = time;
  
   }

  renderer.render( scene, camera );

}