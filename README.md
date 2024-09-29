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

The amount of saltRounds determins the complexity of the password hashing. Increasing this to 12 or even 14 would signficantly increase the complexity of the hash and can be used in situations where security is incredibly important, however more compute is required to complete the operation. Given my usage 10 appears to be a happy medium between security and performance. Any less than 10 appears to produce a fairly insecure hash.

Initially I had this under the client because I believe that sending a non-hashed password over the network isn't a great idea. However taking this approach gave the the following warning in the console:

```js
bcryptjs.js?v=ff64cdd0:12 Module "crypto" has been externalized for browser compatibility. Cannot access "crypto.randomBytes" in client code.
```

I then did some googling to see if there was a safe method of sending passwords over the network, and the answer I found was HTTPS. It seems that HTTPS encrypts data that is sent, meaning that intercepting the data mid transfer wouldn't reveal this data. With my worries put to bed, I simply moved my hashing logic to the server side.

### Session Validation

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

This obtains grabs the username from the key, and allows me to access that location in the database without giving the client the ability to tamper with the value. The token can still be viewed at any time under the browser dev tools >> Application >> Session storage >> web url >> Key >> authToken, however this value is hashed and unreadable to a user. One thing I've considered is returning a token upon registration, however for now I've opted to keep the registration independant from the login. This pushes the user to login after registration. I feel this has a better flow, and gets the user familiar with the login system post registration.

After a little while of playing around with this, I needed to restructure a little of what I was doing. I brought back the LoginProvider.jsx and modified its contents. Here I will query a new endpoint called /session, which will have the dedicated task of validating my login token. Once the token is validated, I can then store this token and use it when viewing the profile or in any other future instance where I need profile specific information.

### React Routes

With the data seemingly entering into the table as I would expect I turned my attention to making the client side connected. Instead of just throwing each component onto the page under main, I needed to segment my pages based on the 4 main components I had. I would also create 2 additonal pages, one at the root "/" and another to handle any route that didn't match what I've defined "\*". To to this I used `react-router-dom`, a node module that gives me all the functionality to create routes and link them together. I started by placing each individual route inside App.jsx and then sourrounded this with the element Routes. After doing this I got an error and I was confused for a good few minutes. It looked perfectly correct but I must've been forgetting something simple. Then I remembered that these routes don't work without BrowserRouter sourrounding the Routes. I added this into main.jsx just inside StrictMode. With all the routes defined correctly, I could now manually navidate to each individual page using the defined suffix.

Next I needed an elegant way for the user to navigate between these pages. I created a Header.jsx component and used Link to create teathers to the routes with clickable links. These work similarly to "<a>" tags in html. From here I wanted to sort out redirects. I started by going under the (response.ok) check and redirecting the user over to "/profile" using useNavigate.

Using useNavigate from react router, I am able to redirect the user to different pages when certain criteria has been met. For my usage, I wanted the page to redirect on a form submission. Under the the login and editprofile form submission I would have the page redirect to the profile page. Under the register form submission I would have the page redirect to the login page. This creates an intuitive system that takes the user to the next step of the process without leaving them to work it out themselves.

From here I needed a way of conditionally rendering the different elements in the header to reflect what the user could or couldn't do in their current position. To do this I would use my previously created LoginProvider which checks if the token is validated. Using truthy, falsy on this value I can dictate which routes to render under the Header.jsx at any given time. Next I needed to handle situations where the user attempted to manually visit the "/profile" page despite not being logged in and have them redirected back to the home page. To do this I created a ProtectedRoute.jsx which I would encapsulate around the routes I wanted protected. In here I would once again use truthy, falsy to determin if the currentLogin is validated by a valid token. From here I would either return the child element or return a redirect to the homepage. This essentially creates protected routes, making these routes restricted to users not logged in.

### Styling

With the data being gathered correctly and all the pages/redirects handling correctly, it is time to style the page. I focused my attention on formatting Profile.jsx since this was currently just dumping two fairly large images onto the page. to remedy this, I added a class to the container element gave it a definative size in pixels. This meant that no matter what size the page was it wouldn't change shape. I did the same with the elements inside of this container. From here I assigned positon relative to the container and position absolute to each of the children. This allowed me to position them exactly where I wanted them inside this container. Once I was happy with this I moved on.

Next I took a look at the Header. This was fixed at the top of every page and contained links to each of the other pages. I wanted to give it a small transparancy to the background of this header so the main background can show through. Using past projects as a reference, I grabbed some styling for the background and transparent elements and placed them inside both App.css and Header.css. I then handled @media queries to ensure that when utilising the login system on mobile it would scale nicely. In some instances I needed multiple media queries to ensure even the smallest phone size of 320px wide would be able to see all of the content.

Before taking a look at styling for either Login, Register or EditProfile, I first had a look at all three of the forms I had been using and made sure the autocomplete attributes given aligned with the standard. I checked this through https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete. I then made sure each of the inputs had a name and className. Once this was done I could begin styling the different components. From here I contained my forms inside div elements and set the display to flex. for both the container and the form. I then applied a background to the container and rounded the edges for an elegant look. From here I added colouring to the form elements and modified the flex direction for mobile displays.

### Refactoring

With the styling complete and everything looking and opperating basically exactly how I wanted, it was time to refactor the server to use express router. This would clean up the extremely large server file that I currently have and break the different operations into smaller parts. I'm not entirely sure what a good naming convention is for the routes, so I just settled on /api. This is probably not the best name to give it, but describes what it is, so it's probably fine. From here I broke my three endpoints into two controllers, one for login and one for profile. I then used a routes.js file to handle which endpoint sends the traffic to where and tethered this back to my server.js through `app.use("/api", routes)`.

## Requirements

There is one important requirement for this project which I did not include. This was .map(). The reason for this is due to the fact there was no data stored in my database that needed to be looped over, since all the data gathered was in a one-to-one relation. To show my understanding of this element despite not utilising the feature during the project, I will give an example of how I would have used it:

```jsx
return (
  <div>
    {data.map((mapMsg) => (
      <IndividualMessages key={mapMsg.id} mapMsg={mapMsg} />
    ))}
  </div>
);
```

Using the above, .map would take the data object (which would first be obtained through a fetch), similarly to forEach a variable can be given any name to represent the looped over data. This is identical to using data.message[i] or data.username[i] in a standard for loop. This variable is passed down to the component IndividualMessages as a prop where the individual objects can be referenced using the dot notation. In this instance, IndividualMessages would return something like the following:

```js
return (
  <div id={mapMsg.id}>
    <p
      id={`message-${mapMsg.id}`}
    >{`${mapMsg.message} - ${mapMsg.username}`}</p>
  </div>
);
```

The above takes the identity key and assigns that as a unique id. Since this is essentially a for loop, if there were 10 elements to loop over, each div would be given a unique identifier assigned as the div id. In this 10 element example, 10 unique divs would be created, each containing 10 unique <p> tag elements containing the corresponding message and username.

The above mapping assumes that the object given contains {id, message, username}.

Besides this the following requirements were completed:

- Client created using react

- Server created using express. Featuring a GET endpoint, and 3 POST endpoints.

- 3 React forms were using under the components Login, Register and EditProfile.

- Multiple pages were used. Each form has a unique page, same with home and profile.

- a PostgreSQL database is used to hold both tables used through Supabase.

Additional features include:

- The pages dynamically change with react-router-dom, but can also be navigated manually with the Link elements in the Header.

- Utilising bcrypt to hash passwords on the server.

- Utilising jsonwebtoken to validate login sessions.

- Utilising endpoint queries (using request.query) to dictate endpoint operation.

- Error handling on both client and server all potential problems (that I could find).

- Utilising express routes.

## Overview

While many of the potential stretch requirements for this submission were not completed I believe I've excelled in other areas. I managed to create a fully functioning login system which allows profile customisation. I got stuck in the rabbit hole for quite a while trying to get user authentication working, trying to manage errors, display relevant information to the client as informative errors, and make the flow of the page as user friendly as possible.

To expand on this basic login later, I can add additonal content to either under Home ("/") or create additonal pages that can utilise the unique login system. One possible thought is to create a forum that uses the users display name to create posts in various categories, utilising another database to contain this data and output it to the page. Using one database entry to dictate the page, another for the user and another containing a title and message. Then potentially reference ids to the post which can be filtered through to obtain other user comments for that post.
