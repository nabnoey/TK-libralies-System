const KaraokeRoom = require("../models/karaokeRoom.model");
const karaokeRoomController = {};

karaokeRoomController.create = async (req, res) => {
  try {
    const { name, image } = req.body;

    if (!name || !image) {
      res.status(400).send({ message: "name and image cannot be empty!" });
      return;
    }

    const newKaraokeRoom = {
      name: name,
      image: image,
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
    const { name, image } = req.body;
    const { id } = req.params;

    if (!name && !image) {
      return res
        .status(400)
        .json({ message: "name or image cannot be empty!" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (image) updateData.image = image;

    await KaraokeRoom.update(
      updateData,
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