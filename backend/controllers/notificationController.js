const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'fullName username profileImage pulseScore')
      .populate('post', 'content image postType')
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving notifications' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
      return res.json({ message: 'All notifications marked as read' });
    }

    const notification = await Notification.findOne({ _id: id, recipient: req.user._id });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification' });
  }
};

module.exports = { getNotifications, markAsRead };
