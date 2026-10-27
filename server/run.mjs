import {createGameServer} from './http.mjs';
const requested=Number(process.env.PORT||process.env.GAME_SERVER_PORT||8787);
if(!Number.isInteger(requested)||requested<1||requested>65535)throw Error('Invalid port');
const address=process.env.RENDER?'0.0.0.0':'127.0.0.1';
const server=createGameServer();server.listen(requested,address,()=>console.log(`Game server listening on ${address}:${requested}`));
