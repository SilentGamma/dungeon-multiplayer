// Screen coordinates have +Y down: positive cross product means clockwise.
// A small dead zone keeps touch jitter from reversing the rotating arrow.
export function rotationSide(initialAngle,dx,dy,previous=1){
 const side=Math.cos(initialAngle)*dy-Math.sin(initialAngle)*dx;
 return Math.abs(side)<6?previous:side<0?-1:1;
}

// Convert a screen-space destination relative to the rendered player, never the
// screen center. The camera, arena scale and canvas offset are supplied by view.
export function clickTrajectory(point,player,frame){
 if(!point||!player||!frame)return null;
 const values=[point.clientX,point.clientY,player.x,player.y,frame.x,frame.y,frame.scale];if(!values.every(Number.isFinite)||frame.scale<=0)return null;
 const dx=point.clientX-(frame.x+player.x*frame.scale),dy=point.clientY-(frame.y+player.y*frame.scale);
 return Math.hypot(dx,dy)<1?null:Math.atan2(dy,dx);
}
