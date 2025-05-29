const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Goal = require("../models/goal.js");
const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    req.body.author = req.user._id;
    const goal = await Goal.create(req.body);
    goal._doc.author = req.user;
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const goals = await Goal.find({})
      .populate("author")
      .sort({ createdAt: "desc" });
    res.status(200).json(goals);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get("/:goalId", verifyToken, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId).populate([
      'author',
      'comments.author',
    ]);
    res.status(200).json(goal);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.put("/:goalId", verifyToken, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);

    if (!goal.author.equals(req.user._id)) {
      return res.status(403).send("You are not the author so cannot edit this comment - Sorry!");
    }
    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.goalId,
      req.body,
      { new: true }
    );
    updatedGoal._doc.author = req.user;
    res.status(200).json(updatedGoal);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.delete("/:goalId", verifyToken, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);

    if (!goal.author.equals(req.user._id)) {
      return res.status(403).send("You are not the author so cannot delete this comment - Sorry!");
    }

    const deletedGoal = await Goal.findByIdAndDelete(req.params.goalId);
    res.status(200).json(deletedGoal);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.post("/:goalId/comments", verifyToken, async (req, res) => {
  try {
    req.body.author = req.user._id;
    const goal = await Goal.findById(req.params.goalId);
    goal.comments.push(req.body);
    await goal.save();

    const newComment = goal.comments[goal.comments.length - 1];
    newComment._doc.author = req.user;
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.put("/:goalId/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);
    const comment = goal.comments.id(req.params.commentId);

    if (comment.author.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this comment" });
    }
    comment.text = req.body.text;
    await goal.save();
    res.status(200).json({ message: "Comment updated successfully" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.delete("/:goalId/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);
    const comment = goal.comments.id(req.params.commentId);

    if (comment.author.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this comment" });
    }
    goal.comments.remove({ _id: req.params.commentId });
    await goal.save();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.post("/:goalId/information", verifyToken, async (req, res) => {
  try {
    req.body.author = req.user._id;
    const goal = await Goal.findById(req.params.goalId);
    goal.information.push(req.body);
    await goal.save();

    const newInformation = goal.information[goal.information.length - 1];
    newInformation._doc.author = req.user;
    res.status(201).json(newInformation);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.delete("/:goalId/information/:informationId", verifyToken, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);
    const information = goal.information.id(req.params.informationId);

    if (information.author.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this update" });
    }

    goal.information.remove({ _id: req.params.informationId });
    await goal.save();
    res.status(200).json({ message: "Update deleted successfully" });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;