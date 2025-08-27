- Action that will be propagated to other clients
- Action can modify data on the server (e.g. update position of a [[Token]])

# Message fields
- Target [[Token]], [[scene]], [[board]]... unique id
- Action type

# Example
- User makes a change to a scene name
- Scene name is sent to server
- Scene is updated on the server, server send **Ack** to the client and [[#Action-update]] message to other clients