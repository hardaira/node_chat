'use strict';

import { Room } from '../models/roomModel.js';

const getAll = async () => {
  const result = await Room.findAll();

  return result;
};

const getById = async (id) => {
  return Room.findByPk(id);
};

const create = async ({ name }) => {
  return Room.create({ name });
};

const update = async ({ name }) => {
  return Room.update({ name }, { where: { id } });
};

const remove = async (id) => {
  return Room.destroy({ where: { id } });
};

export default {
  getAll,
  getById,
  create,
  update,
  remove,
};
