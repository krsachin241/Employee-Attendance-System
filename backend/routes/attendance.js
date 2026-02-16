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
router.get('/my-history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await Attendance.find({ userId }).sort({ date: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get monthly summary
router.get('/my-summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const month = req.query.month;
    if (!month) return res.status(400).json({ message: 'month query param required (YYYY-MM)' });
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

// Get today's status
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const record = await Attendance.findOne({ userId, date: todayDate });
    if (!record) return res.json({ status: 'Not Checked In', record: null });
    const status = record.checkOutTime ? 'Day Complete' : 'Checked In';
    res.json({ status, record });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard API (uses token)
const dashboardHandler = async (req, res) => {
  try {
    const userId = req.user.id;
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
};
router.get('/dashboard/employee', authMiddleware, dashboardHandler);
router.get('/dashboard/employee/:userId', authMiddleware, dashboardHandler);

// ==================== MANAGER ROUTES ====================

import { roleMiddleware } from '../middleware/auth.js';

// GET /api/attendance/all - All employees attendance (department-scoped)
router.get('/all', authMiddleware, roleMiddleware(['manager']), async (req, res) => {
  try {
    const managerDept = req.userDetails.department;
    const { employeeId, startDate, endDate, status } = req.query;

    const deptEmployees = await User.find({ role: 'employee', department: managerDept });
    const deptUserIds = deptEmployees.map(u => u._id);
    const filter = { userId: { $in: deptUserIds } };

    if (employeeId) {
      const matchedUsers = deptEmployees.filter(u =>
        u.employeeId.toLowerCase().includes(employeeId.toLowerCase()) ||
        u.name.toLowerCase().includes(employeeId.toLowerCase())
      );
      filter.userId = { $in: matchedUsers.map(u => u._id) };
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        filter.date.$lt = end;
      }
    }

    if (status) filter.status = status;

    const records = await Attendance.find(filter)
      .populate('userId', 'name email employeeId department role')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/attendance/employee/:id - Specific employee attendance (department-scoped)
router.get('/employee/:id', authMiddleware, roleMiddleware(['manager']), async (req, res) => {
  try {
    const managerDept = req.userDetails.department;
    const { id } = req.params;

    const employee = await User.findById(id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    if (employee.department !== managerDept) {
      return res.status(403).json({ message: 'Access denied: employee is not in your department' });
    }

    const { startDate, endDate } = req.query;
    const filter = { userId: id };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        filter.date.$lt = end;
      }
    }

    const records = await Attendance.find(filter).sort({ date: -1 });
    res.json({
      employee: { name: employee.name, email: employee.email, employeeId: employee.employeeId, department: employee.department },
      records
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/attendance/summary - Team summary (department-scoped)
router.get('/summary', authMiddleware, roleMiddleware(['manager']), async (req, res) => {
  try {
    const managerDept = req.userDetails.department;
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const employees = await User.find({ role: 'employee', department: managerDept });
    const deptUserIds = employees.map(u => u._id);
    const totalEmployees = employees.length;

    const todayRecords = await Attendance.find({ date: todayDate, userId: { $in: deptUserIds } });
    const presentToday = todayRecords.filter(r => r.status === 'present').length;
    const lateToday = todayRecords.filter(r => r.status === 'late').length;
    const halfDayToday = todayRecords.filter(r => r.status === 'half-day').length;
    const absentToday = totalEmployees - todayRecords.length;

    const monthRecords = await Attendance.find({ date: { $gte: thisMonthStart, $lt: thisMonthEnd }, userId: { $in: deptUserIds } });
    let monthPresent = 0, monthLate = 0, monthAbsent = 0, monthHalfDay = 0, monthTotalHours = 0;
    monthRecords.forEach(r => {
      if (r.status === 'present') monthPresent++;
      if (r.status === 'late') monthLate++;
      if (r.status === 'absent') monthAbsent++;
      if (r.status === 'half-day') monthHalfDay++;
      if (r.totalHours) monthTotalHours += Number(r.totalHours);
    });

    const employeeSummaries = employees.map(emp => {
      const empRecords = monthRecords.filter(r => r.userId.toString() === emp._id.toString());
      const present = empRecords.filter(r => r.status === 'present').length;
      const late = empRecords.filter(r => r.status === 'late').length;
      const absent = empRecords.filter(r => r.status === 'absent').length;
      const halfDay = empRecords.filter(r => r.status === 'half-day').length;
      const hours = empRecords.reduce((sum, r) => sum + (Number(r.totalHours) || 0), 0);
      return { name: emp.name, employeeId: emp.employeeId, email: emp.email, present, late, absent, halfDay, totalHours: hours.toFixed(2) };
    });

    res.json({
      department: managerDept,
      totalEmployees,
      today: { presentToday, lateToday, halfDayToday, absentToday },
      month: { monthPresent, monthLate, monthAbsent, monthHalfDay, monthTotalHours: monthTotalHours.toFixed(2) },
      employeeSummaries
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/attendance/today-status - Who's present today (department-scoped)
router.get('/today-status', authMiddleware, roleMiddleware(['manager']), async (req, res) => {
  try {
    const managerDept = req.userDetails.department;
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const employees = await User.find({ role: 'employee', department: managerDept });
    const deptUserIds = employees.map(u => u._id);

    const todayRecords = await Attendance.find({ date: todayDate, userId: { $in: deptUserIds } })
      .populate('userId', 'name employeeId department email');

    const checkedInIds = todayRecords.map(r => r.userId?._id.toString());
    const presentEmployees = todayRecords.map(r => ({
      name: r.userId?.name,
      employeeId: r.userId?.employeeId,
      email: r.userId?.email,
      status: r.status,
      checkInTime: r.checkInTime,
      checkOutTime: r.checkOutTime,
      totalHours: r.totalHours
    }));

    const absentEmployees = employees
      .filter(e => !checkedInIds.includes(e._id.toString()))
      .map(e => ({ name: e.name, employeeId: e.employeeId, email: e.email, status: 'absent' }));

    res.json({
      department: managerDept,
      totalEmployees: employees.length,
      presentCount: todayRecords.length,
      absentCount: employees.length - todayRecords.length,
      presentEmployees,
      absentEmployees
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/attendance/export - Export CSV (department-scoped)
router.get('/export', authMiddleware, roleMiddleware(['manager']), async (req, res) => {
  try {
    const managerDept = req.userDetails.department;
    const { startDate, endDate, status } = req.query;

    const deptEmployees = await User.find({ role: 'employee', department: managerDept });
    const deptUserIds = deptEmployees.map(u => u._id);
    const filter = { userId: { $in: deptUserIds } };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        filter.date.$lt = end;
      }
    }
    if (status) filter.status = status;

    const records = await Attendance.find(filter)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

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

// GET /api/attendance/calendar/:month - Team calendar (department-scoped)
router.get('/calendar/:month', authMiddleware, roleMiddleware(['manager']), async (req, res) => {
  try {
    const managerDept = req.userDetails.department;
    const { month } = req.params;
    const [year, m] = month.split('-');
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 1);

    const deptEmployees = await User.find({ role: 'employee', department: managerDept });
    const deptUserIds = deptEmployees.map(u => u._id);

    const records = await Attendance.find({ date: { $gte: start, $lt: end }, userId: { $in: deptUserIds } })
      .populate('userId', 'name employeeId department');

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

    const totalEmployees = deptEmployees.length;
    res.json({ calendarData, totalEmployees });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/attendance/employees - Department employees list
router.get('/employees', authMiddleware, roleMiddleware(['manager']), async (req, res) => {
  try {
    const managerDept = req.userDetails.department;
    const employees = await User.find({ role: 'employee', department: managerDept }).select('name email employeeId department');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/attendance/update/:attendanceId - Update attendance (department-scoped)
router.put('/update/:attendanceId', authMiddleware, roleMiddleware(['manager']), async (req, res) => {
  try {
    const managerDept = req.userDetails.department;
    const { attendanceId } = req.params;

    const attendance = await Attendance.findById(attendanceId).populate('userId', 'department');
    if (!attendance) return res.status(404).json({ message: 'Attendance not found' });
    if (attendance.userId?.department !== managerDept) {
      return res.status(403).json({ message: 'Access denied: employee is not in your department' });
    }

    const update = req.body;
    const updated = await Attendance.findByIdAndUpdate(attendanceId, update, { new: true });
    res.json({ message: 'Attendance updated', attendance: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
