import express from 'express';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Mark attendance (Check In)
router.post('/checkin', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const date = new Date();
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    // Prevent duplicate check-in
    const existing = await Attendance.findOne({ userId, date: today });
    if (existing) return res.status(400).json({ message: 'Already checked in today' });
    const checkInTime = new Date();
    // Late if after 9:30 AM
    const lateThreshold = new Date(today);
    lateThreshold.setHours(9, 30, 0, 0);
    let status = 'present';
    if (checkInTime > lateThreshold) status = 'late';
    const attendance = new Attendance({ userId, date: today, checkInTime, status });
    await attendance.save();
    res.status(201).json({ message: 'Checked in successfully', attendance });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark attendance (Check Out)
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const attendance = await Attendance.findOne({ userId, date });
    if (!attendance) return res.status(404).json({ message: 'Check-in required before checkout' });
    if (attendance.checkOutTime) return res.status(400).json({ message: 'Already checked out today' });
    const checkOutTime = new Date();
    const totalHours = ((checkOutTime - attendance.checkInTime) / (1000 * 60 * 60)).toFixed(2);
    let status = attendance.status;
    if (totalHours < 4) status = 'half-day';
    else if (totalHours >= 8 && status !== 'late') status = 'present';
    await Attendance.findByIdAndUpdate(attendance._id, { checkOutTime, totalHours, status });
    res.json({ message: 'Checked out successfully', totalHours, status });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my attendance history
router.get('/history/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId) return res.status(403).json({ message: 'Forbidden' });
    const history = await Attendance.find({ userId }).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get monthly summary
router.get('/monthly-summary/:userId/:month', authMiddleware, async (req, res) => {
  try {
    const { userId, month } = req.params;
    if (req.user.id !== userId) return res.status(403).json({ message: 'Forbidden' });
    const [year, m] = month.split('-');
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 1);
    const records = await Attendance.find({ userId, date: { $gte: start, $lt: end } });
    const summary = { present: 0, absent: 0, late: 0, 'half-day': 0 };
    records.forEach(r => summary[r.status]++);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard API
router.get('/dashboard/employee/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId) return res.status(403).json({ message: 'Forbidden' });
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    // Today status
    const todayRecord = await Attendance.findOne({ userId, date: todayDate });
    const todayStatus = todayRecord ? (todayRecord.checkInTime ? 'Checked In' : 'Not Checked In') : 'Not Checked In';
    // Monthly stats
    const monthRecords = await Attendance.find({ userId, date: { $gte: thisMonthStart, $lt: thisMonthEnd } });
    let monthlyPresent = 0, monthlyAbsent = 0, monthlyLate = 0, totalHours = 0;
    monthRecords.forEach(r => {
      if (r.status === 'present') monthlyPresent++;
      if (r.status === 'absent') monthlyAbsent++;
      if (r.status === 'late') monthlyLate++;
      if (r.totalHours) totalHours += Number(r.totalHours);
    });
    // Recent attendance
    const recentAttendance = await Attendance.find({ userId }).sort({ date: -1 }).limit(7);
    res.json({ todayStatus, monthlyPresent, monthlyAbsent, monthlyLate, totalHours, recentAttendance });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


// ==================== MANAGER ROUTES ====================

import { roleMiddleware } from '../middleware/auth.js';

// Manager: Dashboard with team stats
router.get('/manager/dashboard', authMiddleware, roleMiddleware(['manager']), async (req, res) => {
  try {
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Today's stats
    const todayRecords = await Attendance.find({ date: todayDate });
    const checkedInToday = todayRecords.length;
    const lateToday = todayRecords.filter(r => r.status === 'late').length;
    const absentToday = totalEmployees - checkedInToday;

    // This month stats
    const monthRecords = await Attendance.find({ date: { $gte: thisMonthStart, $lt: thisMonthEnd } });
    let monthPresent = 0, monthLate = 0, monthAbsent = 0, monthHalfDay = 0, monthTotalHours = 0;
    monthRecords.forEach(r => {
      if (r.status === 'present') monthPresent++;
      if (r.status === 'late') monthLate++;
      if (r.status === 'absent') monthAbsent++;
      if (r.status === 'half-day') monthHalfDay++;
      if (r.totalHours) monthTotalHours += Number(r.totalHours);
    });

    // Department breakdown
    const employees = await User.find({ role: 'employee' });
    const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];
    const departmentStats = [];
    for (const dept of departments) {
      const deptUsers = employees.filter(e => e.department === dept);
      const deptUserIds = deptUsers.map(u => u._id);
      const deptToday = await Attendance.countDocuments({ userId: { $in: deptUserIds }, date: todayDate });
      departmentStats.push({ department: dept, total: deptUsers.length, presentToday: deptToday, absentToday: deptUsers.length - deptToday });
    }

    // Recent team attendance (last 10 records)
    const recentTeam = await Attendance.find().populate('userId', 'name employeeId department').sort({ date: -1 }).limit(10);

    res.json({
      totalEmployees, checkedInToday, lateToday, absentToday,
      monthPresent, monthLate, monthAbsent, monthHalfDay, monthTotalHours,
      departmentStats, recentTeam
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Manager: Get all attendance records with filters (employee, date, status)
router.get('/manager/all', authMiddleware, roleMiddleware(['manager']), async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status, department } = req.query;
    const filter = {};

    // Filter by employee name/ID
    if (employeeId) {
      const users = await User.find({
        $or: [
          { employeeId: { $regex: employeeId, $options: 'i' } },
          { name: { $regex: employeeId, $options: 'i' } },
        ]
      });
      filter.userId = { $in: users.map(u => u._id) };
    }

    // Filter by department
    if (department) {
      const deptUsers = await User.find({ department: { $regex: department, $options: 'i' } });
      if (filter.userId) {
        const existingIds = filter.userId.$in.map(id => id.toString());
        filter.userId.$in = deptUsers.filter(u => existingIds.includes(u._id.toString())).map(u => u._id);
      } else {
        filter.userId = { $in: deptUsers.map(u => u._id) };
      }
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        filter.date.$lt = end;
      }
    }

    // Filter by status
    if (status) filter.status = status;

    const records = await Attendance.find(filter)
      .populate('userId', 'name email employeeId department role')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Manager: Team calendar data (attendance for a given month)
router.get('/manager/calendar/:month', authMiddleware, roleMiddleware(['manager']), async (req, res) => {
  try {
    const { month } = req.params;
    const [year, m] = month.split('-');
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 1);

    const records = await Attendance.find({ date: { $gte: start, $lt: end } })
      .populate('userId', 'name employeeId department');

    // Group by date
    const calendarData = {};
    records.forEach(r => {
      const dateStr = new Date(r.date).toISOString().slice(0, 10);
      if (!calendarData[dateStr]) calendarData[dateStr] = { present: 0, late: 0, absent: 0, 'half-day': 0, records: [] };
      calendarData[dateStr][r.status]++;
      calendarData[dateStr].records.push({
        name: r.userId?.name, employeeId: r.userId?.employeeId,
        department: r.userId?.department, status: r.status,
        checkIn: r.checkInTime, checkOut: r.checkOutTime, totalHours: r.totalHours,
      });
    });

    // Get total employees for absent calculation
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    res.json({ calendarData, totalEmployees });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Manager: Export attendance as CSV
router.get('/manager/export', authMiddleware, roleMiddleware(['manager']), async (req, res) => {
  try {
    const { startDate, endDate, department, status } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        filter.date.$lt = end;
      }
    }

    if (department) {
      const deptUsers = await User.find({ department: { $regex: department, $options: 'i' } });
      filter.userId = { $in: deptUsers.map(u => u._id) };
    }

    if (status) filter.status = status;

    const records = await Attendance.find(filter)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    // Build CSV
    const header = 'Employee ID,Name,Email,Department,Date,Check In,Check Out,Status,Total Hours\n';
    const rows = records.map(r => {
      const u = r.userId || {};
      return [
        u.employeeId || '', u.name || '', u.email || '', u.department || '',
        r.date ? new Date(r.date).toISOString().slice(0, 10) : '',
        r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : '',
        r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '',
        r.status || '', r.totalHours != null ? r.totalHours : '',
      ].join(',');
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.csv');
    res.send(header + rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Manager: Get all employees list
router.get('/manager/employees', authMiddleware, roleMiddleware(['manager']), async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('name email employeeId department');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Manager: Update an employee's attendance record
router.put('/manager/update/:attendanceId', authMiddleware, roleMiddleware(['manager']), async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const update = req.body;
    const attendance = await Attendance.findByIdAndUpdate(attendanceId, update, { new: true });
    if (!attendance) return res.status(404).json({ message: 'Attendance not found' });
    res.json({ message: 'Attendance updated', attendance });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
