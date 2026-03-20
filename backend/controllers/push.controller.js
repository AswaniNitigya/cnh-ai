const webpush = require('web-push');
const supabase = require('../models/supabase');
const fs = require('fs');
const path = require('path');

// VAPID keys setup
const subject = process.env.VAPID_SUBJECT || 'mailto:admin@cnh.com';
let publicKey = process.env.VAPID_PUBLIC_KEY;
let privateKey = process.env.VAPID_PRIVATE_KEY;

if (!publicKey || !privateKey) {
  const vapidPath = path.join(__dirname, '..', '.vapid.json');
  if (fs.existsSync(vapidPath)) {
    const keys = JSON.parse(fs.readFileSync(vapidPath, 'utf8'));
    publicKey = keys.publicKey;
    privateKey = keys.privateKey;
  } else {
    const vapidKeys = webpush.generateVAPIDKeys();
    fs.writeFileSync(vapidPath, JSON.stringify(vapidKeys));
    publicKey = vapidKeys.publicKey;
    privateKey = vapidKeys.privateKey;
    console.log('Generated new VAPID keys completely locally inside .vapid.json');
  }
}

webpush.setVapidDetails(subject, publicKey, privateKey);

const getPublicKey = (req, res) => {
  res.status(200).json({ publicKey });
};

const subscribe = async (req, res) => {
  try {
    const subscription = req.body;
    const userId = req.user.id;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }

    // Save to Supabase
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth
      }, { onConflict: 'endpoint' });

    if (error) throw error;
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
};

const getNotifications = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ notifications: data });
  } catch (err) {
    console.error('Fetch notices error:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
};

const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    let query = supabase.from('notifications').update({ is_read: true }).eq('user_id', req.user.id);
    if (id !== 'all') {
      query = query.eq('id', id);
    }
    const { error } = await query;
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Failed' });
  }
};

// Utility to send push to multiple users
const sendPushNotification = async (userIds, payload) => {
  try {
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds);
    
    if (error || !subs || subs.length === 0) return;

    const payloadString = JSON.stringify(payload);
    const promises = subs.map(sub => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      };
      return webpush.sendNotification(pushSub, payloadString).catch(async (e) => {
        if (e.statusCode === 404 || e.statusCode === 410) {
          // Subscription expired/invalid, delete it
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
      });
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('sendPushNotification error:', error);
  }
};

// Utility to create in-app notifications
const createInAppNotifications = async (userIds, title, body, linkId) => {
  try {
    const inserts = userIds.map(id => ({ user_id: id, title, body, link_id: linkId }));
    if (inserts.length === 0) return;
    await supabase.from('notifications').insert(inserts);
  } catch (err) {
    console.error('createInAppNotifications error:', err);
  }
};

module.exports = { getPublicKey, subscribe, getNotifications, markRead, sendPushNotification, createInAppNotifications };
