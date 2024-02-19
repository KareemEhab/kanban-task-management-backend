const { Router } = require("express");
const router = Router();
const { Board, validate } = require("../models/board");

// Function to exclude __v field
const excludeVField = { __v: 0 };

// Get all boards
router.get("/", async (req, res) => {
  const boards = await Board.find({}, excludeVField);
  res.send(boards);
});

// Create a new board
router.post("/", async (req, res) => {
  let { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let board = new Board({
    name: req.body.name,
    columns: req.body.columns,
    tasks: req.body.tasks,
  });

  await board.save();

  // Exclude the __v field from the response
  board = await Board.findById(board._id).select("-__v");

  res.send(board);
});

// Get board By ID
router.get("/:id", async (req, res) => {
  const board = await Board.findById(req.params.id).select(excludeVField);
  if (!board)
    return res.status(404).send("The board with the given ID does not exist.");
  res.send(board);
});

// Update board By ID
router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    console.log(req.body);
    console.error(error.details[0].message);
    return res.status(400).send(error.details[0].message);
  }

  const board = await Board.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      columns: req.body.columns,
      tasks: req.body.tasks,
    },
    { new: true }
  ).select(excludeVField);

  if (!board)
    return res.status(404).send("The board with the given ID does not exist.");

  res.send(board);
});

// Delete board By ID
router.delete("/:id", async (req, res) => {
  const board = await Board.findByIdAndDelete(req.params.id).select(
    excludeVField
  );

  if (!board)
    return res.status(404).send("The board with the given ID does not exist.");

  res.send(board);
});

module.exports = router;
