Authorization payload:
```
{
	userToken: token
	game: gameId
}
```

TODO:
Client is required to send a [[Join|join]] message 60 seconds after joining or they are automatically disconnected ^43deb3

[[Server]] keeps track of the assigned socket and where receiving [[Join|join]] message will assign the socket to an appropriate [[Room|room]].