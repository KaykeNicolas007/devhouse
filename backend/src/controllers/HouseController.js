const House = require("../models/House");
const User = require("../models/User");

class HouseController {
  async store(req, res) {
    const { filename } = req.file;
    const { description, price, location, status } = req.body;
    const { user_id } = req.headers;

    let house = await House.create({
      user: user_id,
      thumbnail: filename,
      description,
      price,
      location,
      status,
    });

    return res.json(house);
  }

  async index(req, res) {
    const { status } = req.query;

    const houses = await House.find({ status });

    return res.json(houses);
  }

  async update(req, res) {
    const { filename } = req.file;
    const { house_id } = req.params;
    const { description, price, location, status } = req.body;
    const { user_id } = req.headers;

    const user = await User.findById(user_id);
    const house = await House.findById(house_id);

    if (String(house.user) !== String(user._id)) {
      return res.status(401).json({ error: "Não autorizado!" });
    }

    await House.updateOne(
      { _id: house_id },
      {
        user: user_id,
        thumbnail: filename,
        description,
        price,
        location,
        status,
      },
    );

    return res.send();
  }
}

module.exports = new HouseController();
