require("dotenv").config();
const express = require("express");
const app = express();
require("express-async-errors");
const logger = require("./services/logging");

require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();
require("./startup/prod")(app);

const port = process.env.PORT || 3000;

app.listen(port, () => logger.info(`Listening on port ${port}`));
