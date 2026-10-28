export const COLORS=Object.freeze({green:'#99efb1',gold:'#ffcf78',blue:'#9ebdff',pink:'#fca1bd',purple:'#d8b1ff',teal:'#79e2e4',lime:'#a9e64b',coral:'#ffad83'});
export const DEFAULT_COLOR='green';
export function validColor(value){return typeof value==='string'&&Object.hasOwn(COLORS,value)}
export function colorFor(value){return COLORS[validColor(value)?value:DEFAULT_COLOR]}
export function colorName(value){const name=validColor(value)?value:DEFAULT_COLOR;return name[0].toUpperCase()+name.slice(1)}
