const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';
const MOCK_NOTIFICATIONS_KEY = 'mockNotifications';

const defaultNotifications = [
  {
    id: 'siege-alert',
    title: 'Shadow Siege begins tonight',
    body: 'Defend the North Wall to earn relic shards.',
    time: '2h ago',
    read: false,
  },
  {
    id: 'sunforge-rumor',
    title: 'Sunforge awakens',
    body: 'Follow the ember trail with your party.',
    time: '5h ago',
    read: false,
  },
  {
    id: 'arena-reset',
    title: 'Arena brackets reset',
    body: 'Climb to Rank IV for legendary sigils.',
    time: '1d ago',
    read: true,
  },
];

const getStoredNotifications = () => {
  try {
    const raw = localStorage.getItem(MOCK_NOTIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setStoredNotifications = (notifications) => {
  localStorage.setItem(MOCK_NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

class NotificationService {
  getNotifications() {
    if (!MOCK_AUTH) {
      return [];
    }

    const stored = getStoredNotifications();
    if (!stored) {
      setStoredNotifications(defaultNotifications);
      return defaultNotifications;
    }

    return stored;
  }

  markAllRead() {
    if (!MOCK_AUTH) {
      return [];
    }

    const updated = this.getNotifications().map((item) => ({ ...item, read: true }));
    setStoredNotifications(updated);
    return updated;
  }
}

export default new NotificationService();
