CREATE TABLE login (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE preferences (
  id SERIAL PRIMARY KEY,
  background_url TEXT,
  profile_img TEXT,
  displayname VARCHAR(100),
  user_id INT UNIQUE,  -- One-to-one relationship with the login table
  FOREIGN KEY (user_id) REFERENCES login(id)
);

-- retrieve user and preferences
SELECT login.username, preferences.background_url, preferences.profile_img, preferences.displayname
FROM login
INNER JOIN preferences ON login.id = preferences.user_id
WHERE login.username = 'exampleUser';