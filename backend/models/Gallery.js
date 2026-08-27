const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Photos shown in the public website's gallery. isFeatured + sortOrder control
// which photos appear in the homepage slideshow (top featured photos, capped to 5).
const Gallery = sequelize.define("Gallery", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  imageUrl: { type: DataTypes.STRING, allowNull: false }, // e.g. "/uploads/gallery/169900-photo.jpg"
  caption: { type: DataTypes.STRING },
  isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false }, // shown in the homepage slideshow
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 }, // lower first, in both the grid and the slideshow
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: true }, // false = hidden from the public site, kept in admin panel
});

module.exports = Gallery;
