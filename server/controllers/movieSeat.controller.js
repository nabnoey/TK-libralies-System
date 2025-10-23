const MovieSeat = require("../models/movieSeat.model");
const movieSeatController = {};

movieSeatController.create = async (req, res) => {
  try {
    const { name, image, status } = req.body;

    if (!name || !image || status === undefined) {
      res
        .status(400)
        .send({ message: "name, image or status can not be empty!" });
      return;
    }

    const newMovieSeat = {
      name: name,
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

movieSeatController.getAll = async (req, res) => {
  try{
    await MovieSeat.findAll().then((movieseats) => {
      res.send(movieseats)
    })
  }catch(error){
    res.status(500).send({
      message: e.message || "Something error while getting all MovieSeat"
    })
  }
}

movieSeatController.getById = async (req, res) => {
  try{
    const { id } = req.params
    await MovieSeat.findByPk(id).then((movieseat) => {
      if(!movieseat){
        res.status(404).send({ message: `no found movieseat with id ${id}`})
      }else{
        res.send(movieseat)
      }
    })
  }catch(error){
    res.status(500).send({
      message: error.message || "something error while getting MovieSeat"
    })
  }
}

movieSeatController.update = async (req, res) => {
  try{
    const { name, image, status } = req.body
    const { id } = req.params

    if(!name && !image && status === undefined){
      return res.status(400).json({ message: 'name, image or status can not empty!'})
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (image) updateData.image = image;
    if (status !== undefined) updateData.status = status;

    await MovieSeat.update(updateData, { where: { movieId: id}}).then((n) => {
      if(n[0] === 1){
        res.send({ message: 'MovieSeat Update Successfully!'})
      }else{
        res.status(404).send({ message: `Can not update MovieSeat with id ${id}. Maybe MovieSeat was not found or req. body is emety!`})
      }
    })
  }catch(error){
    res.status(500).send({ message: error.message || "Server Error" })
  }
}

movieSeatController.deleteById = async (req, res) => {
  try{
    const { id } = req.params

    if (!id) {
      return res.status(404).send({ message: "id is missing"})
    }

    await MovieSeat.destroy({ where: { movieId: id }}).then((n) => {{
      if(n === 1) {
        res.send({ message: `MovieSeat was deleted successfully.`})
      }else{
        res.status(404).send({ message: `can not deleted restaurant with id ${id}. Maybe MovieSeat was not found or req. body is emety!`})
      }
    }})
  }catch(error){
    res.status(500).send({
      message: error.message || "Server Error"
    })
  }
}

module.exports = movieSeatController