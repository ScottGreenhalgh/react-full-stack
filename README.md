# React/Express Full Stack

### Conceptualising Ideas

This project involved utilising a full stack react project using forms and a database. The overall goal was relatively abstract and left a lot of room for me to create my own ideas and interpretations of what to make. I therefore started by brainstorming ideas of what I could make and how I would go about it. Knowing that an sql postgres database was needed, and incorporating relational databases was core to the project I needed a webpage that is designed to store data in two seperate databases that had unique functionality but the data stored within had relations to the other. The options were therfore to create a one-to-one, one-to-many or many-to-many relationship between the data storage. I initially thought about previous projects where databases have been used in the past, such as a guestbook, containing usernames, comments, likes, dislikes. From here I was unsure how to tether that database to another that stored meaningful data, plus I wanted to do something a little more outside the box. I wanted an idea that I would be able to translate down the line to something functional for another project. I looked around at other webpages to see if I could visualise a example of this relation in a production setting and then the idea hit me. I could create a basic login system. A table storing usernames and passwords, with another table containing data relevant to that specific user, using the username as a reference between the tables. This would take on a one-to-one relation, eliminating the need to incorporate a relational database table alongside it.

### The SQL Database tables

With the idea firmly planted in my mind, with working external examples to use as reference material, I started creating some tables. The first table as mentioned previously would contain just the username and password. The second table would contain some user preferences. After a little thought on what this could be, I settled on some basic profile customisations. A background img for a profile banner, a profile picture and a custom display name. Putting the username inside this table too as a reference to the login, I then used `FOREIGN KEY (user_id) REFERENCES login(id)` to tether the two tables together.

### The Boilerplate

Next I began work on creating my working environment. I used npm create vite@latest to create a react project with javascript and housed it inside a client folder. I installed all the relevant packages on the client with `npm i` and modified the `eslint.config.js` to include the rule `"react/prop-types": 0,`. I then deleted the assets folder and generated README.md file (creating my own outside the client folder) and created a components folder under src. Lastly I made a client .env file containing my VITE_HOST which would be equal to http://localhost:8080 in my development environment (this will be changed to the server URL when deployed). I then created an accompanying server folder, running `npm i express pg dotenv cors` on the server gathering everything I needed to run an express server that could run queries to databases. I then modified the package.json file to include `"type": "module"` and added a dev script which would run `node --watch server`, allowing me to see real time updates. From here I created a seed.sql file containing everything I ran to create the database tables. I then created a server.js and imported each of the modules I installed. I created a .env file and placed the DB_URL inside and then used pg to link to this database. I then created a root endpoint at "/" and an app.listen to start the server on port 8080.

### Endpoints

With the basics out of the way, I next needed to create some endpoints to handle my database requests, and handshake that data to the client. For this reason I opted to create two distinct endpoints. The first endpoint would handle the login and the second would handle profile information. I would then use query strings to determin whether or not the request coming in would be for a read or write to the database. To do this I used `{action} = request.query` which utilises deconstruction to reference the action query. For the login endpoint I would have this be either `login?action=login` or `login?action=register` I would then seperate this endpoint into two halves using if statements to handle the desired logic for each request. I found it important to also handle my edge cases too. I ensured that both a username and password would be present before handling the query, returning an error early if not. I then encapsulated my if statements in a try, and a catch to handle any unforseen errors. I then copied this approach when handling the profile.

### Components in React

With the endpoints looking roughly how I needed them, I turned my attention to the client. To begin, I created a seperate component to handle all 4 of the instances I was expecting at the endpoints. This was registering, logging in, accessing your profile and editing your profile. I then used await fetch to send information between the client and server in each component. In the return field of the login and register components, I created forms with the expected inputs of a login. I used a function to handle the form submit, which would send this data to the endpoint for storage.

### Bcrypt

Knowing I was dealing with passwords, I knew I couldn't just store them in the database without either encrypting the data or hashing it first. I found that hashing the data was a relatively easy process with Bcrypt so I opted to undertake this option. Using this module, I'm able to hash the password and store this in the database using:

```js
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

Initially I had this under the client because I believe that sending a non-hashed password over the network isn't a great idea. However taking this approach gave the the following warning in the console:

```js
bcryptjs.js?v=ff64cdd0:12 Module "crypto" has been externalized for browser compatibility. Cannot access "crypto.randomBytes" in client code.
```

I then did some googling to see if there was a safe method of sending passwords over the network, and the answer I found was HTTPS. It seems that HTTPS encrypts data that is sent, meaning that intercepting the data mid transfer wouldn't reveal this data. With my worries put to bed, I simply moved my hashing logic to the server side.

### Initial Issues

It became quite apparent relatively early on that the approach I was taking was not ideal. When submitting forms to the database the data was retained in memory thanks to the useState. This became an issue since the fields were not emptying after submission. This was a relatively easy fix since all I needed to do was call the function associate with the useState and assign it the value of (""). This is where it got relatively complicated. My initial thought was to retain this username and password combination within a useContext to allow this information to be transferable to other components. For example when accessing the profile, I would use this value from useContext to query the database and fetch the profile assocaiated. If I clear the setUsername field, this would no longer be possible. I needed to find an alternative method. My initial thought here was to look at using local storage, but two immediate issues came to mind when I considered this approach. The first was that local storage can easily be modified any time, meaning I could just change the username to anyones profile and gain full access to the customisations. I could use an accompanying password to validate this but that brings me to the second problem. Storing passwords here in plain text didn't seem like a good idea.

I then turned my attention to sessionStorage which seems to operate similarly to localStorage, but expires at the end of each session (when the browser is closed). This seemed good at first, but carries the same problems with spoofing profiles with the browser developer tools. At this point it seemed like client side validation wasn't going to be the answer as long as developer tools exist. I needed some level of server side validation. This is when I came across the concept of Json Web Tokens or JWT for short. This allows the server to generate a a session token and send that back to the client. Without this token accompanying the request, the request is invalidated, eliminating my prior concerns of security risk.

To start fixing this issue I remove my useContext. I then reassigned all of these variables to a useState in every location where they were being called. Next I had each field clear after a successful entry. I then run `npm i jsonwebtoken` on the server. From here I sign the tokens with at the login endpoint with:

```js
const token = jwt.sign({ username }, process.env.JWT_SECRET, {
  expiresIn: "1h",
});
```

Next I generate a secret key from https://jwtsecret.com/generate and add it to my .env file. I can then attach this token to the response when sending it back to the client where it can be stored in sessionStorage. From here I need a method of reading the token when accessing the profile. To do this I used the following under the profile endpoint:

```js
const token = req.headers.authorization.split(" ")[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
const username = decoded.username;
```

This obtains grabs the username from the key, and allows me to access that location in the database without giving the client the ability to tamper with the value.
