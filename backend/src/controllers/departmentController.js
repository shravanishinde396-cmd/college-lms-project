import asyncHandler from 'express-async-handler';
import Department from '../models/Department.js';

export const getDepartments = asyncHandler(async (_req, res) => {
  const departments = await Department.find().sort({ createdAt: -1 });
  res.json({ success: true, departments });
});

export const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json({ success: true, department });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, department });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  await Department.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Department deleted' });
});
