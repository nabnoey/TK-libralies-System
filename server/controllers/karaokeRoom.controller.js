const KaraokeRoom = require("../models/karaokeRoom.model");
const karaokeRoomController = {};

karaokeRoomController.create = async (req, res) => {
  try {
    const { image, status } = req.body;

    if (!image || status === undefined) {
      res.status(400).send({ message: "image or status cannot be empty!" });
      return;
    }

    const newKaraokeRoom = {
      image: image,
      status: status,
    };

    const newRoom = await KaraokeRoom.create(newKaraokeRoom);
    res.status(201).send(newRoom);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: error.message || "Error while creating KaraokeRoom" });
  }
};

karaokeRoomController.getAll = async (req, res) => {
  try {
    await KaraokeRoom.findAll().then((rooms) => {
      res.send(rooms);
    });
  } catch (error) {
    res.status(500).send({
      message:
        error.message || "Something went wrong while getting all KaraokeRooms",
    });
  }
};

karaokeRoomController.getById = async (req, res) => {
  try {
    const { id } = req.params;
    await KaraokeRoom.findByPk(id).then((room) => {
      if (!room) {
        res.status(404).send({ message: `No KaraokeRoom found with id ${id}` });
      } else {
        res.send(room);
      }
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Something went wrong while getting KaraokeRoom",
    });
  }
};

karaokeRoomController.update = async (req, res) => {
  try {
    const { image, status } = req.body;
    const { id } = req.params;

    if (!image && !status) {
      return res
        .status(400)
        .json({ message: "image or status cannot be empty!" });
    }

    await KaraokeRoom.update(
      { image: image, status: status },
      { where: { karaokeId: id } }
    ).then((n) => {
      if (n[0] === 1) {
        res.send({ message: "KaraokeRoom updated successfully!" });
      } else {
        res.status(404).send({
          message: `Cannot update KaraokeRoom with id ${id}. Maybe it was not found or request body is empty!`,
        });
      }
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Server Error" });
  }
};

karaokeRoomController.deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(404).send({ message: "id is missing" });
    }

    await KaraokeRoom.destroy({ where: { karaokeId: id } }).then((n) => {
      if (n === 1) {
        res.send({ message: "KaraokeRoom was deleted successfully." });
      } else {
        res.status(404).send({
          message: `Cannot delete KaraokeRoom with id ${id}. Maybe it was not found!`,
        });
      }
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Server Error",
    });
  }
};

module.exports = karaokeRoomController;