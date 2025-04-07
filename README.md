# Assignment Four
## Purpose
The purpose of this assignment is to leverage Google’s analytics policies to gather information about the requests being sent in by users.

Using the information already entered to MongoDB for the previous assignment, you will add another collection of reviews that are tied to the movies. This way users can query the database and get the previous information (title, year released and actors) as well as the reviews. These two entities should remain separate! Do not append the reviews to the existing movie information.  

Leverage the Async.js library or mongo $lookup aggregation capability to join the entities.

(This is based on a template given for the assignment)

## Things of Note

-Unable to get my mongoDB to connect (Still in the process of trying to fix this even after submission)
    Error Thrown by Render: MongooseError: The `uri` parameter to `openUri()` must be a string, got "undefined". Make sure the first parameter to `mongoose.connect()` or `mongoose.createConnection()` is a string.
    -Steps I've taken to try and resolve the error:
        1. Created an .env file to house the following code segment:
            MONGO_URI=mongodb+srv://jessican101800:pass@assignment4.8abualg.mongodb.net/?retryWrites=true&w=majority&appName=Assignment4
            SECRET_KEY=0658db4c9206c90852fc7b20054afe7d
            **Result**: Failed
        2. Hardcoded URL into Server.js
            **Result**: Failed
        3. Scrapped the cluster on MongoDB and recreated it
            **Result**: Failed
        4. Scrapped entire MongoDB project and recreated it
            **Result**: Failed

-Due to errors with the mongoDB connection, Postman has been effected in some parts for me. Oddly enough, the POST and GET requests work for me, but any other throws a 502 error.

-I made a copy of each of the requests into my assignment 4 postman and also created a replacement cluster for the Movies database, my previous one started to cause issues that I couldn't fix or identify it since it kept throwing a red error box saying "an error has occured."

## Postman Button
[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/41738051-2b6367df-8513-4f3f-9b84-cccd798b3227?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D41738051-2b6367df-8513-4f3f-9b84-cccd798b3227%26entityType%3Dcollection%26workspaceId%3Da4250de4-ab16-4e10-864c-e1bf56c53dd0)