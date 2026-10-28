export const DESKTOP_CAMERA=Object.freeze({width:1.12,height:.97});
export const MOBILE_CAMERA=Object.freeze({width:.74,height:1.02});
export function cameraScale(width,height,mobile=width<650){const camera=mobile?MOBILE_CAMERA:DESKTOP_CAMERA;return Math.min(width/camera.width,height/camera.height)}
