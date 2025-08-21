**Client** send the join message with the following payload:
- game_id
- authentication

If authentication is valid proceed, otherwise disconnect the socket.
Assign [[Room|room]] to socket and register [[Action|action]] message handler.
At this point client should can start receiving [[Action|action]] messages but not apply them. Messages should only be applied after the server sends all the data through the [[Join finished|join-finished]] message.

 **Server** handles the join event in following steps:
1. Load all entities from the database. Order of sending [[Entity kind|entity kinds]] matters.
2. Send entities based on their priority defined by [[Entity kind|entity kind]].
3. Send any entities that are in the queue.