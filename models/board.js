const Joi = require("joi");
const mongoose = require("mongoose");

const subTaskSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 3,
    max: 50,
    required: true,
  },
  isDone: {
    type: Boolean,
    default: false,
  },
});

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 3,
    max: 50,
    required: true,
  },
  description: String,
  subTasks: {
    type: [subTaskSchema],
    required: true,
  },
  currentStatus: {
    type: String,
    required: true,
  },
});

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 3,
    max: 50,
    required: true,
  },
  columns: {
    type: [String],
    default: ["Todo", "Doing", "Done"],
  },
  tasks: [taskSchema],
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

const Board = mongoose.model("Board", boardSchema);

const validateBoard = (board) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    columns: Joi.array().items(Joi.string()),
    tasks: Joi.array().items(
      Joi.object().keys({
        name: Joi.string().min(3).max(50).required(),
        description: Joi.string(),
        subTasks: Joi.array()
          .items(
            Joi.object().keys({
              name: Joi.string().min(3).max(50).required(),
              isDone: Joi.boolean().default(false),
            })
          )
          .required(),
        currentStatus: Joi.string().required(),
      })
    ),
    dateCreated: Joi.date(),
  });

  return schema.validate(board);
};

exports.Board = Board;
exports.validate = validateBoard;
