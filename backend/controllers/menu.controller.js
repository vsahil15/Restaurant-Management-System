import Menu from '../models/menu.model.js';

const listMenu = async (req, res) => {
  try {
    const menuItems = await Menu.find({ available: true }).sort({ category: 1, name: 1 });
    return res.status(200).json({ menu: menuItems });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Failed to load menu items.' });
  }
};

const addMenuItem = async (req, res) => {
  const { name, description, price, category, available } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ message: 'Menu item name and price are required.' });
  }

  try {
    const item = new Menu({ name, description, price, category, available });
    await item.save();
    return res.status(201).json({ message: 'Menu item added successfully.', item });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Failed to add menu item.' });
  }
};

const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, available } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ message: 'Menu item name and price are required.' });
  }

  try {
    const item = await Menu.findByIdAndUpdate(
      id,
      { name, description, price, category, available },
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }
    return res.status(200).json({ message: 'Menu item updated successfully.', item });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Failed to update menu item.' });
  }
};

const deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Menu.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }
    return res.status(200).json({ message: 'Menu item deleted successfully.' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: 'Failed to delete menu item.' });
  }
};

export { listMenu, addMenuItem, updateMenuItem, deleteMenuItem };
