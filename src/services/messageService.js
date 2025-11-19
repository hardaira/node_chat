'use strict';

// import { Op } from 'sequelize';
import { Message } from '../models/messageModel.js';

const getAll = async (queryParams) => {
  const { userId, roomId } = queryParams;

  const whereCondition = {};

  if (roomId) {
    whereCondition.roomId = roomId;
  }

  if (userId) {
    whereCondition.userId = userId;
  }

  const result = await Message.findAll({
    where: whereCondition,
  });

  return result;
};

const getById = async (id) => {
  return Message.findByPk(id);
};

const create = async ({ text, author, roomId }) => {
  return Message.create({
    text,
    author,
    roomId,
  });
};

const update = async ({ text, author, roomId }) => {
  return Message.update(
    {
      text,
      author,
      roomId,
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
