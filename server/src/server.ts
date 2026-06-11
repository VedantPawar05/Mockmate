import dotenv from "dotenv";
dotenv.config({ override: true });

import app from "./app";
import http from "http";

const port = Number(process.env.PORT) || 8000;

const httpServer = http.createServer(app);

httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
});