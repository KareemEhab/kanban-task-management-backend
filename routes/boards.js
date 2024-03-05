const auth = require("../middleware/auth");
const { Router } = require("express");
const router = Router();
const { Board, validate } = require("../models/board");
const _ = require("lodash");

// Function to exclude __v field
const excludeVField = { __v: 0 };

// Get all boards
router.get("/", auth, async (req, res) => {
  const boards = await Board.find({ user_id: req.user._id }, excludeVField);
  res.send(boards);
});

// Create a new board
router.post("/", auth, async (req, res) => {
  let { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Add user_id to the new board
  let board = new Board({
    user_id: req.user._id,
    name: req.body.name,
    columns: req.body.columns,
    tasks: req.body.tasks,
  });

  // Save the new board to the database
  await board.save();

  res.send(_.omit(board.toObject(), "__v"));
});

// Get board By ID
router.get("/:id", auth, async (req, res) => {
  const board = await Board.findById(req.params.id).select(excludeVField);
  if (!board)
    return res.status(404).send("The board with the given ID does not exist.");
  if (req.user._id !== board.user_id)
    return res
      .status(403)
      .send("The user has no authorization over this board.");
  res.send(board);
});

// Update board By ID
router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    console.error(error.details[0].message);
    return res.status(400).send(error.details[0].message);
  }

  const board = await Board.findById(req.params.id).select(excludeVField);
  if (!board) {
    return res.status(404).send("The board with the given ID does not exist.");
  }

  // Check if the user has authorization over this board
  if (req.user._id !== board.user_id.toString()) {
    return res
      .status(403)
      .send("The user has no authorization over this board.");
  }

  board.name = req.body.name;
  board.columns = req.body.columns;
  board.tasks = req.body.tasks;

  const updatedBoard = await board.save();

  res.send(_.omit(updatedBoard.toObject(), "__v"));
});

// Delete board By ID
router.delete("/:id", auth, async (req, res) => {
  const board = await Board.findById(req.params.id).select(excludeVField);
  if (!board) {
    return res.status(404).send("The board with the given ID does not exist.");
  }

  // Check if the user has authorization over this board
  if (req.user._id !== board.user_id.toString()) {
    return res
      .status(403)
      .send("The user has no authorization over this board.");
  }

  const deletedBoard = await Board.findByIdAndDelete(req.params.id).select(
    excludeVField
  );
  res.send(deletedBoard);
});

module.exports = router;
