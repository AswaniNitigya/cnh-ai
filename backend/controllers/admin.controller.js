const supabase = require('../models/supabase');
const scraperService = require('../services/scraper.service');

// Trigger the web scraper manually
const triggerScraper = async (req, res) => {
  try {
    const urls = req.body?.urls || [];
    const results = await scraperService.scrape(urls);
    res.json({
      message: 'Scraper completed successfully.',
      newNotices: results.newCount,
      skipped: results.skippedCount,
      details: results.details,
    });
  } catch (err) {
    console.error('Scraper trigger error:', err);
    res.status(500).json({ error: 'Scraper failed: ' + err.message });
  }
};

// Get dashboard stats
const getStats = async (req, res) => {
  try {
    const { count: totalNotices } = await supabase
      .from('notices')
      .select('*', { count: 'exact', head: true });

    const { count: activeStudents } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');

    const { count: pendingReviews } = await supabase
      .from('notices')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft');

    const { data: lastScrape } = await supabase
      .from('scraped_logs')
      .select('date_found')
      .order('date_found', { ascending: false })
      .limit(1)
      .single();

    res.json({
      totalNotices: totalNotices || 0,
      activeStudents: activeStudents || 0,
      pendingReviews: pendingReviews || 0,
      lastScrape: lastScrape?.date_found || null,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
};

// Get all users (admin management)
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, role } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('id, email, name, role, branch, year_of_grad, dept, section, is_cr, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error, count } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch users.' });
    }

    res.json({ users, total: count });
  } catch (err) {
    console.error('Users error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// Get pending users
const getPendingUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, role, branch, year_of_grad, dept, section, is_cr, created_at, phone, status')
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(users || []);
  } catch (err) {
    console.error('Fetch pending users error:', err);
    res.status(500).json({ error: 'Server error fetching pending users' });
  }
};

// Approve user
const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Update status to active
    const { data: user, error } = await supabase
      .from('users')
      .update({ status: 'active' })
      .eq('id', id)
      .select()
      .single();

    if (error || !user) {
      console.error('Supabase update error on approval:', error);
      return res.status(500).json({ error: 'Failed to approve user in DB.' });
    }

    res.json({ message: 'User approved securely.', user });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ error: 'Server error during approval.' });
  }
};

// Reject user
const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete the rejected user row to keep DB clean
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    res.json({ message: 'User rejected and removed.' });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ error: 'Server error during rejection.' });
  }
};

module.exports = { triggerScraper, getStats, getUsers, getPendingUsers, approveUser, rejectUser };
