Load all entities from the database. Order of sending entity kinds matters.
Send order:
1. Scene
2. TokenData
3. Token
4. ...
5. Any other user defined entity kind

While sending the initial data, all other messages that need to be broadcasted to the joining socket need to be added to a list and sent to the joining socket after it finishes receiving initial data.