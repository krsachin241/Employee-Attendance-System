import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAttendanceHistory = createAsyncThunk('attendance/fetchHistory', async (userId) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/attendance/history/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch history');
  return data;
});

export const fetchMonthlySummary = createAsyncThunk('attendance/fetchMonthlySummary', async ({ userId, month }) => {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/attendance/monthly-summary/${userId}/${month}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch summary');
  return data;
});

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    history: [],
    summary: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceHistory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAttendanceHistory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.history = action.payload;
      })
      .addCase(fetchAttendanceHistory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchMonthlySummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  },
});

export default attendanceSlice.reducer;
