const House = require("../models/House");
const User = require("../models/User");
const z = require("zod");

class HouseController {
  async store(req, res) {
    const schema = z.object({
      description: z.string(),
      price: z.coerce.number(),
      location: z.string(),
      status: z.coerce.boolean(),
    });

    const { filename } = req.file;
    const { description, price, location, status } = req.body;
    const { user_id } = req.headers;

    const parseResult = schema.safeParseAsync(req.body);

    if (!(await parseResult).success) {
      return res.status(400).json({ error: "Falha na validação!" });
    }

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
    const schema = z.object({
      description: z.string(),
      price: z.coerce.number(),
      location: z.string(),
      status: z.coerce.boolean(),
    });

    const { filename } = req.file;
    const { house_id } = req.params;
    const { description, price, location, status } = req.body;
    const { user_id } = req.headers;

    const user = await User.findById(user_id);
    const house = await House.findById(house_id);

    const parseResult = schema.safeParseAsync(req.body);

    if (!(await parseResult).success) {
      return res.status(400).json({ error: "Falha na validação!" });
    }

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

  async destroy(req, res) {
    const { house_id } = req.body;
    const { user_id } = req.headers;

    const user = await User.findById(user_id);
    const house = await House.findById(house_id);

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado!" });
    }

    if (!house) {
      return res.status(404).json({ error: "Casa não encontrada!" });
    }

    if (String(house.user) !== String(user._id)) {
      return res.status(401).json({ error: "Não autorizado!" });
    }

    await House.findByIdAndDelete({ _id: house_id });

    return res.json({ message: "Casa excluída com sucesso!" });
  }
}

module.exports = new HouseController();
