'use strict';

import { Message } from '../models/messageModel.js';

//
const getAll = async () => {
  const result = await Message.findAll();

  return result;
};


const getById = async (id) => {
  return Message.findByPk(id);
};

const create = async ({ text, author, room }) => {
  return Message.create({
    text,
    author,
    room,
  });
};

const update = async ({ text, author, room }) => {
  return Message.update(
    {
      text,
      author,
      room,
    },
    { where: { id } },
  );
};

const remove = async (id) => {
  return Message.destroy({ where: { id } });
};

export default {
  getAll,
  getById,
  create,
  update,
  remove,
};
