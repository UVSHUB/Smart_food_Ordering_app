# Food Menu Management Module

### Submitter: pamindi024

This document outlines the complete Food Menu Management module for the Smart Food Ordering System, matching all CRUD requirements, database schemas, and React Native frontend specifications.

---

## 1. Backend Folder Structure

```text
backend/
└── src/
    ├── controllers/
    │   └── foodController.js
    ├── models/
    │   └── Food.js
    └── routes/
        └── foodRoutes.js
```

---

## 2. Backend Code

### Model (`backend/src/models/Food.js`)
```javascript
const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true, default: 0.0 },
  isAvailable: { type: Boolean, required: true, default: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Food', foodSchema);
```

### Controller (`backend/src/controllers/foodController.js`)
```javascript
const Food = require('../models/Food');

// Fetch all foods + Search & Filter
const getFoods = async (req, res, next) => {
  try {
    const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: 'i' } } : {};
    const category = req.query.category ? { category: req.query.category } : {};
    const foods = await Food.find({ ...keyword, ...category });
    res.json(foods);
  } catch (error) {
    next(error);
  }
};

// Fetch single food
const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (food) res.json(food);
    else res.status(404).json({ message: 'Food not found' });
  } catch (error) {
    next(error);
  }
};

// Create food
const createFood = async (req, res, next) => {
  try {
    const { name, price, description, category, image } = req.body;
    const food = new Food({ name, price, description, image, category });
    const createdFood = await food.save();
    res.status(201).json(createdFood);
  } catch (error) {
    next(error);
  }
};

// Update food
const updateFood = async (req, res, next) => {
  try {
    const { name, price, description, image, category } = req.body;
    const food = await Food.findById(req.params.id);
    if (food) {
      food.name = name || food.name;
      food.price = price || food.price;
      food.description = description || food.description;
      food.category = category || food.category;
      if (image) food.image = image;
      const updatedFood = await food.save();
      res.json(updatedFood);
    } else {
      res.status(404).json({ message: 'Food not found' });
    }
  } catch (error) {
    next(error);
  }
};

// Delete food
const deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (food) {
      await food.deleteOne();
      res.json({ message: 'Food item removed' });
    } else {
      res.status(404).json({ message: 'Food not found' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getFoods, getFoodById, createFood, updateFood, deleteFood };
```

### Routes (`backend/src/routes/foodRoutes.js`)
```javascript
const express = require('express');
const { getFoods, getFoodById, createFood, updateFood, deleteFood } = require('../controllers/foodController');

const router = express.Router();

router.route('/')
  .get(getFoods)
  .post(createFood);

router.route('/:id')
  .get(getFoodById)
  .put(updateFood)
  .delete(deleteFood);

module.exports = router;
```

---

## 3. Frontend Expo App Structure

```text
frontend/
└── src/
    └── screens/
        ├── MenuAdmin/
        │   ├── FoodListScreen.js
        │   ├── AddFoodScreen.js
        │   └── EditFoodScreen.js
        └── Home/
            └── FoodDetailScreen.js
```

*(Note: Full React Component codes for screen UI are extensive, but utilize React Hooks `useState`/`useEffect`, navigation, and `axios` for standard HTTP connectivity to `192.168.x.x:5001`. See attached local `frontend/src/` components logic.)*

---

## 4. Step-by-step Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install express mongoose dotenv cors nodemon
   ```
2. **Configure Environment**
   Create a `.env` file in the `backend/` folder:
   ```env
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/smartfood
   ```
3. **Register Routes**
   In `backend/src/server.js`:
   ```javascript
   require('dotenv').config();
   const express = require('express');
   const mongoose = require('mongoose');
   const cors = require('cors');
   const foodRoutes = require('./routes/foodRoutes');

   const app = express();
   app.use(cors());
   app.use(express.json());

   app.use('/api/foods', foodRoutes);

   mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })
     .then(() => app.listen(process.env.PORT, () => console.log('Server running on 5001')))
     .catch(err => console.error(err));
   ```
4. **Start Server**
   ```bash
   npm run dev 
   # or
   nodemon server.js
   ```

---

## 5. Step-by-step Expo Mobile Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```
2. **Configure Local IP**
   Open `FoodListScreen.js` (and other screens) and change `BASE_URL` to match your computer's local IP address (e.g., `http://192.168.1.5:5001/api/foods`).
3. **Start Expo Server**
   ```bash
   npx expo start --clear
   ```
4. **Run on Mobile Device**
   Open the **Expo Go** application on your physical device, ensure it's connected to the same Wi-Fi as your development machine, and scan the QR code displayed in the terminal.

---

## 6. Example API Testing (Postman)

**Base URL**: `http://localhost:5001/api/foods`

**1. Create Food (POST)**
- Method: `POST`
- URL: `/api/foods`
- Body (RAW - JSON):
```json
{
  "name": "Classic Cheeseburger",
  "description": "Juicy beef patty with melted cheese, lettuce, and tomato.",
  "price": 8.99,
  "category": "Meals",
  "image": "https://example.com/burger.jpg"
}
```

**2. Get All Foods (GET)**
- Method: `GET`
- URL: `/api/foods`
  *(Optional Filter/Search: `/api/foods?category=Meals` or `/api/foods?keyword=burger`)*

**3. Get Single Food (GET)**
- Method: `GET`
- URL: `/api/foods/<FOOD_ID>`

**4. Update Food (PUT)**
- Method: `PUT`
- URL: `/api/foods/<FOOD_ID>`
- Body (RAW - JSON):
```json
{
  "price": 9.99
}
```

**5. Delete Food (DELETE)**
- Method: `DELETE`
- URL: `/api/foods/<FOOD_ID>`
