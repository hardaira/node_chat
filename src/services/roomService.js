'use strict';

import { Room } from '../models/roomModel.js';

const getAll = async () => {
  const result = await Room.findAll();

  return result;
};

const getById = async (id) => {
  return Room.findByPk(id);
};

const create = async ({ title }) => {
  return Room.create({ title });
};

const update = async ({ title }) => {
  return Room.update({ title }, { where: { id } });
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
