require("dotenv").config();

const { createApp } = require("./app");

const port = Number(process.env.PORT) || 3000;

createApp()
  .then(({ app }) => {
    app.listen(port, () => {
      console.log(`Settl is running at http://localhost:${port}`);
      console.log("All funds are simulated. The chain lives in memory and resets on restart.");
    });
  })
  .catch((error) => {
    console.error("Settl could not start:", error.message);
    process.exit(1);
  });
