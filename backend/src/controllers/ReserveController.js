const Reserve = require("../models/Reserve");
const User = require("../models/User");
const House = require("../models/House");

class ReserveController {
  async store(req, res) {
    const { user_id } = req.headers;
    const { house_id } = req.params;
    const { date } = req.body;

    const house = House.findById(house_id);
    if (!house) {
      return res.status(400).json({ error: "Essa casa não existe!" });
    }

    if (!house.status) {
      return res.status(400).json({ error: "Solicitação indisponível!" });
    }

    const user = await User.findById(user_id);
    if (String(user._id) === String(user_id)) {
      return res.status(401).json({ error: "Reserva da própria casa!" });
    }

    const reserve = await Reserve.create({
      user: user_id,
      house: house_id,
      date,
    });

    await reserve.populate(["house", "user"]);

    return res.json(reserve);
  }

  async index(req, res) {
    const { user_id } = req.headers;

    const reserves = await Reserve.find({ user: user_id }).populate(["house"]);

    return res.json(reserves);
  }

  async destroy(req, res) {
    const { reserve_id } = req.body;

    await Reserve.findByIdAndDelete({ _id: reserve_id });

    return res.send();
  }
}

module.exports = new ReserveController();
