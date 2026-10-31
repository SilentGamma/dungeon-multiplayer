// Set up a ready party for tests whose subject is gameplay rather than the ready gate.
export function startReadyParty(session,id){for(const p of session.players)session.ready(p.id,true);return session.start(id)}
