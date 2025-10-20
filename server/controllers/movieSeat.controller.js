const MovieSeat = require("../models/movieSeat.model");
const movieSeatController = {};

movieSeatController.create = async (req, res) => {
  try {
    const { image, status } = req.body;

    if (!image || !status) {
      res
        .status(400)
        .send({ message: ", image or status can not be empty!" });
      return;
    }

    const newMovieSeat = {
      image: image,
      status: status,
    };

    const newSeat = await MovieSeat.create(newMovieSeat)

    res.status(201).send(newSeat);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: error.message || "Error while creating MovieSeat" });
  }
};

module.exports = movieSeatController