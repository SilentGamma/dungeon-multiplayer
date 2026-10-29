# Larp Dungeon lobby flow

The landing page follows the supplied four-screen wireframe: centered title, create/join navigation, party lobby, and public-lobby directory. Cream, charcoal and lime are the main palette; character colors remain reserved for role art and party tokens. Layouts adapt to desktop and mobile.

The top-right player panel contains a required name and a name-only favorite-role carousel. Preferences persist on the device. Favorite selection is a preference, not a reservation: the server assigns it atomically during create/join if free, otherwise assigns the first available role. No duplicate roles are allowed. Players can still choose another free role in the party portrait carousel. Only joined players have party tokens.

Create offers Public or Private before creating. Join opens all joinable public lobbies plus a six-digit room-code field. Names are required by both client and server. The host alone starts the run.
