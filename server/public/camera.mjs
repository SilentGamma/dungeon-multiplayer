export const DESKTOP_CAMERA=Object.freeze({width:1.3,height:1.2});
export const MOBILE_CAMERA=Object.freeze({width:1.25,height:1.2});
// Keep a complete locked room between the HUD and bottom action controls.
export function cameraFrame(width,height,mobile=width<650){const camera=mobile?MOBILE_CAMERA:DESKTOP_CAMERA,top=Math.min(mobile?120:132,height*.28),bottom=Math.min(76,height*.18),side=Math.min(18,width*.05);return {scale:Math.min((width-side*2)/camera.width,Math.max(1,height-top-bottom)/camera.height),centerX:width/2,centerY:(top+height-bottom)/2,top,bottom,side}}
export function cameraScale(width,height,mobile=width<650){return cameraFrame(width,height,mobile).scale}
