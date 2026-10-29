// Screen coordinates have +Y down: positive cross product means clockwise.
// A small dead zone keeps touch jitter from reversing the rotating arrow.
export function rotationSide(initialAngle,dx,dy,previous=1){
 const side=Math.cos(initialAngle)*dy-Math.sin(initialAngle)*dx;
 return Math.abs(side)<6?previous:side<0?-1:1;
}
