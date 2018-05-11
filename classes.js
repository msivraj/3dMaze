// EXAMPLE TO FOLLOW

// class Rectangle {
//   constructor(height, width) {
//     this.height = height;
//     this.width = width;
//   }
//   // Getter
//   get area() {
//     return this.calcArea();
//   }
//   // Method
//   calcArea() {
//     return this.height * this.width;
//   }
// }
// 
// const square = new Rectangle(10, 10);
// 
// console.log(square.area); // 100

//INHERITANCE
// function Teacher(first, last, age, gender, interests, subject) {
//   Person.call(this, first, last, age, gender, interests);
// 
//   this.subject = subject;
// }

class rectorsquareside{
  constructor(vert1,vert2){
    this.vert1=vert1;
    this.vert2=vert2;
    // Put distance formula here
    this.base=Math.sqrt((vert2.x-vert1.x)**2 + (vert2.z-vert1.z)**2);//add 10 here to increase the bounds of bounding box
    this.halfz;
    this.halfx;
    if(vert1.x==vert2.x){
      if(vert1.z>vert2.z){
        this.halfz=vert1.z-this.base/2;
        this.halfx=vert1.x;
      }else{
        this.halfz=vert2.z-this.base/2;
        this.halfx=vert1.x;
      }
    }
    else if(vert1.z==vert2.z){
      if(vert1.x>vert2.x){
        this.halfx=vert1.x-this.base/2;
        this.halfz=vert1.z;
      }else{
        this.halfx=vert2.x-this.base/2;
        this.halfz=vert1.z;
      }
    }
    // this.height=Math.sqrt((x-center.x)**2 + (z-center.z)**2);
  }
}


class Static3dCubeorRect{
  constructor(mesh,sides){
    // MESH IS MESH OBJECT CENTER IS A VECTOR3 THAT IS THE CENTER POINT OF THE MESH AND SIDES IS A ARRAY OF THE SIDES
    // this.x1Boundary=0;
    // this.x2Boundary=0;
    // this.z1Boundary=0;
    // this.z2Boundary=0;
    // this.x3Boundary=0;
    // this.x4Boundary=0;
    // this.z3Boundary=0;
    // this.z4Boundary=0;
    this.sides=sides;
    // this.vert1=0;
    // this.vert2=0;
    // this.vert3=0;
    // this.vert4=0;
    // this.bounds1=[];
    // this.bounds2=[];
    this.width=mesh.geometry.parameters.width;//x
    this.depth=mesh.geometry.parameters.depth;//z
    this.height=mesh.geometry.parameters.height;//y
    this.area=this.width*this.depth;
    // this.center=center;
    this.mesh=mesh
    // this.isRotated=false;
    // this.Yrotation=0;
    // this.Xrotation=0;
    // this.Zrotation=0;
    
  }
  
}


// class building