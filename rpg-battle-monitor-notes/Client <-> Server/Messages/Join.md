**Client** send the join message with the following payload:
- game_id
- authentication

If authentication is valid proceed, otherwise disconnect the socket.
Assign [[Room|room]] to socket and register [[Action|action]] message handler.
At this point client should can start receiving [[Action|action]] messages but not apply them. Messages should only be applied after the server sends all the data through the [[Join finished|join-finished]] message.

 **Server** handles the join event in following steps:
1. Load all entities from the database.
2. Load any entities from queue for that [[Room|room]]
3. Send all entities to the client with [[Join|join]] message
4. Respond with [[Join finished|join-finished]] message

**Client** handles the join event in the following steps (any entities received through [[Action|action]] message need to be queued and applied last):
1. On each received [[Join|join]] message add entities into a list
2. After [[Join finished|join-finished]]  event is received **client** can process entities
3. Client sorts entities based on their priority defined by [[Entity kind|entity kinds]]
4. Apply all entities and process any queued [[Action|action]] messages

