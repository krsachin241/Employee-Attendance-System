import express from 'express';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/dashboard/employee - Employee stats (uses token)
router.get('/employee', authMiddleware, async (req, res) => {
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
});

// GET /api/dashboard/manager - Manager stats (department-scoped)
router.get('/manager', authMiddleware, roleMiddleware(['manager']), async (req, res) => {
  try {
    const managerDept = req.userDetails.department;
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Only employees in manager's department
    const employees = await User.find({ role: 'employee', department: managerDept });
    const deptUserIds = employees.map(u => u._id);
    const totalEmployees = employees.length;

    // Today's stats (only department employees)
    const todayRecords = await Attendance.find({ date: todayDate, userId: { $in: deptUserIds } });
    const checkedInToday = todayRecords.length;
    const lateToday = todayRecords.filter(r => r.status === 'late').length;
    const absentToday = totalEmployees - checkedInToday;

    // This month stats (only department employees)
    const monthRecords = await Attendance.find({ date: { $gte: thisMonthStart, $lt: thisMonthEnd }, userId: { $in: deptUserIds } });
    let monthPresent = 0, monthLate = 0, monthAbsent = 0, monthHalfDay = 0, monthTotalHours = 0;
    monthRecords.forEach(r => {
      if (r.status === 'present') monthPresent++;
      if (r.status === 'late') monthLate++;
      if (r.status === 'absent') monthAbsent++;
      if (r.status === 'half-day') monthHalfDay++;
      if (r.totalHours) monthTotalHours += Number(r.totalHours);
    });

    // Department breakdown (only manager's own department)
    const departmentStats = [{
      department: managerDept,
      total: totalEmployees,
      presentToday: checkedInToday,
      absentToday: absentToday
    }];

    // Recent team attendance (last 10 records, department only)
    const recentTeam = await Attendance.find({ userId: { $in: deptUserIds } })
      .populate('userId', 'name employeeId department').sort({ date: -1 }).limit(10);

    // Weekly attendance trend (last 7 days, department only)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayRecords = await Attendance.find({ date: dayStart, userId: { $in: deptUserIds } });
      const present = dayRecords.filter(r => r.status === 'present').length;
      const late = dayRecords.filter(r => r.status === 'late').length;
      const halfDay = dayRecords.filter(r => r.status === 'half-day').length;
      const absent = totalEmployees - dayRecords.length;
      weeklyTrend.push({
        date: dayStart.toISOString().slice(0, 10),
        dayLabel: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        present, late, halfDay, absent, total: dayRecords.length,
      });
    }

    // Absent employees today (department employees who have NOT checked in)
    const checkedInUserIds = todayRecords.map(r => r.userId.toString());
    const absentEmployees = employees
      .filter(e => !checkedInUserIds.includes(e._id.toString()))
      .map(e => ({ name: e.name, employeeId: e.employeeId, department: e.department, email: e.email }));

    res.json({
      totalEmployees, checkedInToday, lateToday, absentToday,
      monthPresent, monthLate, monthAbsent, monthHalfDay, monthTotalHours,
      departmentStats, recentTeam, weeklyTrend, absentEmployees
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
