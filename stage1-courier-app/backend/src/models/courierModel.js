const couriers = [];

const getAll = () => couriers;

const add = (courier) => {
  couriers.push(courier);
};

export default {
  getAll,
  add,
};
