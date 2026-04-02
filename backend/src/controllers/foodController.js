const Food = require('../models/Food');

// @desc    Fetch all foods
// @route   GET /api/foods
// @access  Public
const getFoods = async (req, res, next) => {
  try {
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    const foods = await Food.find({ ...keyword });
    res.json(foods);
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single food
// @route   GET /api/foods/:id
// @access  Public
const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);

    if (food) {
      res.json(food);
    } else {
      res.status(404);
      throw new Error('Food not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a food item
// @route   POST /api/foods
// @access  Private/Admin
const createFood = async (req, res, next) => {
  try {
    const { name, price, description, category, isAvailable } = req.body;
    let image = '/images/sample-food.jpg';

    // Check if an image was uploaded via multer and attached to req.file
    if (req.file) {
      image = `/${req.file.path}`; // e.g. /uploads/image-12345.jpg
    }

    const food = new Food({
      name,
      price,
      description,
      image,
      category,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    const createdFood = await food.save();
    res.status(201).json(createdFood);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a food item
// @route   PUT /api/foods/:id
// @access  Private/Admin
const updateFood = async (req, res, next) => {
  try {
    const { name, price, description, image, category, isAvailable } = req.body;

    const food = await Food.findById(req.params.id);

    if (food) {
      food.name = name || food.name;
      food.price = price || food.price;
      food.description = description || food.description;
      food.category = category || food.category;
      
      if (isAvailable !== undefined) {
        food.isAvailable = isAvailable;
      }

      // If a new image was uploaded
      if (req.file) {
        food.image = `/${req.file.path}`;
      } else if (image) {
        food.image = image;
      }

      const updatedFood = await food.save();
      res.json(updatedFood);
    } else {
      res.status(404);
      throw new Error('Food not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a food item
// @route   DELETE /api/foods/:id
// @access  Private/Admin
const deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);

    if (food) {
      await food.deleteOne();
      res.json({ message: 'Food item removed' });
    } else {
      res.status(404);
      throw new Error('Food not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
};
