const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Connected to DB");
  const result = await User.updateMany({}, { isAdmin: true });
  console.log("Promoted all users to admin: ", result);
  process.exit();
}).catch(err => {
  console.log(err);
  process.exit(1);
});
