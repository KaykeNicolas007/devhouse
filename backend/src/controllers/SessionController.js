const User = require("../models/User");
const z = require("zod");

class SessionController {
  async store(req, res) {
    const schema = z.object({
      email: z.email(),
    });

    const { email } = req.body;

    const parseResult = schema.safeParseAsync(req.body);

    if (!(await parseResult).success) {
      return res.status(400).json({ error: "E-mail inválido!" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ email });
    }

    return res.json(user);
  }
}

module.exports = new SessionController();
