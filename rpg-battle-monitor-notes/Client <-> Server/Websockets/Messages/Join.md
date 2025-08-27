# Client
#### Emit
After successfully authenticating the [[Client|client]] will emit [[Join|join]] event.
#### Handle
After [[Join#Emit|emitting]] the message needs to be able to handle incoming [[Join|join]] messages.
[[Client]] handles the join event in the following steps (any entities received through [[Action|action]] message need to be queued and applied later):
1. on each received [[Join|join]] message construct entity and its dependencies and add it to a list,
2. after [[Join finished|join-finished]]  event is received **client** can process entities,
3. sort entities based on their priority defined by [[Entity kind|entity kinds]]
4. Apply all entities and process any queued [[Action|action]] messages

# Server
[[Server]] handles [[Join#Emit|clients message]]  in the following steps:
1. assigns a [[Room|room]] to the joining socket. All messages for that socket will be emitted to that [[Room|room]],
2. loads all entities from the database,
3. load any entities from queue for that game,
4. send all entities to the client with [[Join#Emit|join]] message,
5. respond with [[Join finished|join-finished]] message.


