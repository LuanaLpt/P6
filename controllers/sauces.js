const fs = require("fs");
const Sauces = require("../models/sauces");

exports.getAllSauces = (req, res, next) => {
  Sauces.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};
exports.getOneSauce = (req, res, next) => {
  Sauces.findOne({ _id: req.params.id })
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(404).json({ error }));
};
exports.createSauces = (req, res, next) => {
  const saucesObject = JSON.parse(req.body.sauce);
  const sauce = new Sauces({
    ...saucesObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.updateSauce = (req, res, next) => {
  const saucesObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauces.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        Sauces.updateOne(
          { _id: req.params.id },
          { ...saucesObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié !" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => res.status(400).json({ error }));
};
exports.deleteSauce = (req, res, next) => {
  Sauces.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauces.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Objet supprimé" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
exports.likeSauce = (req, res, next) => {
  Sauces.findOne({ _id: req.params.id }).then((sauce) => {
    if (req.body.like == 1) sauce.usersLiked.push(req.body.userId);
    else if (req.body.like == -1) sauce.usersDisliked.push(req.body.userId);
    else {
      const sauceIndexLike = sauce.usersLiked.indexOf(req.body.userId);
      sauce.usersLiked.splice(sauceIndexLike, 1);
      const sauceIndexDislike = sauce.usersDisliked.indexOf(req.body.userId);
      sauce.usersDisliked.splice(sauceIndexDislike, 1);
    }
    sauce.likes = sauce.usersLiked.length;
    sauce.dislikes = sauce.usersDisliked.length;
    Sauces.updateOne({ _id: req.params.id }, sauce)
      .then(() => res.status(200).json({ message: "Like ajouté !" }))
      .catch((error) => res.status(401).json({ error }));
  });
};
