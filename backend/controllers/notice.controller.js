const supabase = require('../models/supabase');

// Get filtered notice feed for student
const getFeed = async (req, res) => {
  try {
    const { branch, year_of_grad, dept, section } = req.user;
    const { category, source, important, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('notices')
      .select('*, poster:posted_by(id, name, role, avatar_url)', { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (important === 'true') {
      const now = new Date().toISOString();
      query = query.or(`pinned_until.gt.${now},priority.eq.p1,priority.eq.p2`);
    } else {
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      
      if (source) {
        query = query.eq('source', source);
      }
    }

    const { data: notices, error, count } = await query;

    if (error) {
      console.error('Feed fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch notices.' });
    }

    // Filter by target_criteria (specificity engine)
    const filtered = notices.filter(notice => {
      const criteria = notice.target_criteria;
      if (!criteria || criteria.global) return true;

      let matches = true;
      if (criteria.branch && criteria.branch !== 'all') {
        matches = matches && criteria.branch === branch;
      }
      if (criteria.year && criteria.year !== 'all') {
        matches = matches && String(criteria.year) === String(year_of_grad);
      }
      if (criteria.dept && criteria.dept !== 'all') {
        matches = matches && criteria.dept === dept;
      }
      if (criteria.section && criteria.section !== 'all') {
        matches = matches && criteria.section === section;
      }
      return matches;
    });

    res.json({
      notices: filtered,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    console.error('Feed error:', err);
    res.status(500).json({ error: 'Server error fetching feed.' });
  }
};

// Get single notice detail
const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: notice, error } = await supabase
      .from('notices')
      .select('*, poster:posted_by(id, name, role, avatar_url)')
      .eq('id', id)
      .single();

    if (error || !notice) {
      return res.status(404).json({ error: 'Notice not found.' });
    }

    // Get related notices (same category)
    const { data: related } = await supabase
      .from('notices')
      .select('id, title, category, created_at, target_criteria')
      .eq('category', notice.category)
      .eq('status', 'active')
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(3);

    res.json({ notice, related: related || [] });
  } catch (err) {
    console.error('Notice detail error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// Post a new notice (manual - Faculty/CR)
const createNotice = async (req, res) => {
  try {
    const { title, content, category, target_criteria, pdf_url, original_image_url, priority, pinned_duration, send_notification } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required.' });
    }

    // If CR, enforce their own branch/year/section
    let finalTarget = target_criteria || { global: true };
    if (req.user.role === 'cr') {
      finalTarget = {
        branch: req.user.branch,
        year: req.user.year_of_grad,
        section: req.user.section,
      };
    }

    let pinned_until = null;
    if (pinned_duration && pinned_duration !== 'none') {
      const durationMap = {
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '1w': 7 * 24 * 60 * 60 * 1000,
        '1m': 30 * 24 * 60 * 60 * 1000,
      };
      if (durationMap[pinned_duration]) {
        pinned_until = new Date(Date.now() + durationMap[pinned_duration]).toISOString();
      }
    }

    const { data: notice, error } = await supabase
      .from('notices')
      .insert([{
        title,
        content,
        category: category || 'general',
        original_image_url: original_image_url || null,
        pdf_url: pdf_url || null,
        posted_by: req.user.id,
        source: 'manual',
        target_criteria: finalTarget,
        status: 'active',
        priority: priority || null,
        pinned_until: pinned_until
      }])
      .select('*, poster:posted_by(id, name, role, avatar_url)')
      .single();

    if (error) {
      console.error('Create notice error:', error);
      return res.status(500).json({ error: 'Failed to create notice.' });
    }

    // Trigger Notifications if requested and authorized
    if (send_notification && (req.user.role === 'super_admin' || req.user.role === 'cr')) {
      try {
        let uQuery = supabase.from('users').select('id');
        if (!finalTarget.global) {
          if (finalTarget.branch && finalTarget.branch !== 'all') uQuery = uQuery.eq('branch', finalTarget.branch);
          if (finalTarget.year && finalTarget.year !== 'all') uQuery = uQuery.eq('year_of_grad', String(finalTarget.year));
          if (finalTarget.section && finalTarget.section !== 'all') uQuery = uQuery.eq('section', finalTarget.section);
        }
        const { data: users } = await uQuery;
        
        if (users && users.length > 0) {
          const userIds = users.map(u => u.id);
          const { createInAppNotifications, sendPushNotification } = require('./push.controller');
          
          const notifTitle = `New Notice: ${title}`;
          const notifBody = content.length > 80 ? content.substring(0, 80) + '...' : content;
          
          await createInAppNotifications(userIds, notifTitle, notifBody, notice.id);
          await sendPushNotification(userIds, { title: notifTitle, body: notifBody, url: '/notice/' + notice.id });
        }
      } catch (notifErr) {
        console.error('Failed to blast notifications:', notifErr);
      }
    }

    res.status(201).json({ notice });
  } catch (err) {
    console.error('Create notice error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// Update a notice
const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, target_criteria, pdf_url, priority, pinned_duration } = req.body;

    // Check ownership or admin
    const { data: existing } = await supabase
      .from('notices')
      .select('posted_by, title, content, pdf_url')
      .eq('id', id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Notice not found.' });
    }

    if (existing.posted_by !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Not authorized to edit this notice.' });
    }

    let pinned_until = undefined; // undefined means do not update, null means clear it
    if (pinned_duration) {
      if (pinned_duration === 'none') {
        pinned_until = null;
      } else {
        const durationMap = {
          '6h': 6 * 60 * 60 * 1000,
          '24h': 24 * 60 * 60 * 1000,
          '1w': 7 * 24 * 60 * 60 * 1000,
          '1m': 30 * 24 * 60 * 60 * 1000,
        };
        if (durationMap[pinned_duration]) {
          pinned_until = new Date(Date.now() + durationMap[pinned_duration]).toISOString();
        }
      }
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (category !== undefined) updates.category = category;
    if (pdf_url !== undefined) updates.pdf_url = pdf_url;
    if (priority !== undefined) updates.priority = priority === 'none' ? null : priority;
    if (target_criteria !== undefined) updates.target_criteria = target_criteria;
    if (pinned_until !== undefined) updates.pinned_until = pinned_until;

    // Set is_edited if title, content, or pdf_url changed
    if (
      (title !== undefined && title !== existing.title) ||
      (content !== undefined && content !== existing.content) ||
      (pdf_url !== undefined && pdf_url !== existing.pdf_url)
    ) {
      updates.is_edited = true;
    }

    const { data: notice, error } = await supabase
      .from('notices')
      .update(updates)
      .eq('id', id)
      .select('*, poster:posted_by(id, name, role, avatar_url)')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update notice.' });
    }

    res.json({ notice });
  } catch (err) {
    console.error('Update notice error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// Delete (archive) a notice
const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('notices')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to archive notice.' });
    }

    res.json({ message: 'Notice archived successfully.' });
  } catch (err) {
    console.error('Delete notice error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// Search notices
const searchNotices = async (req, res) => {
  try {
    const { q, category, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('notices')
      .select('*, poster:posted_by(id, name, role, avatar_url)', { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (q) {
      query = query.or(`title.ilike.%${q}%,content.ilike.%${q}%`);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: notices, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: 'Search failed.' });
    }

    res.json({
      notices: notices || [],
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = { getFeed, getNoticeById, createNotice, updateNotice, deleteNotice, searchNotices };
