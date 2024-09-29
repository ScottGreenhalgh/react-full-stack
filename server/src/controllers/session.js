import jwt from "jsonwebtoken";

export const sessionHandler = async (request, response) => {
  try {
    const authHeader = request.headers.authorization;
    //console.log("Authorization header: ", authHeader);

    if (!authHeader) {
      return response
        .status(400)
        .json({ error: "Authorization header missing" });
    }
    const authToken = authHeader.split(" ")[1];
    //console.log("Recieved Token: ", authToken);
    jwt.verify(authToken, process.env.JWT_SECRET, (error, decoded) => {
      if (error) {
        return response.status(401).json({ error: "Invalid or expired token" });
      }
      const username = decoded.username;
      response.status(200).json({ username });
    });
  } catch (error) {
    return response.status(401).json({ error: "Invalid or expired token" });
  }
};
