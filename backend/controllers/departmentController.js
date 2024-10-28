const catchAsync = require("../utils/catchAsync");
const Department = require("../models/departmentModel");
const Employee = require("../models/employeeModel");
const AppError = require("../utils/AppError");
const Ticket = require("../models/ticketModel");

exports.getAllDepartments = catchAsync(async (req, res, next) => {
  const departments = await Department.find();
  if (!departments) return next(new AppError("No Departments Found!"));
  res.status(200).json({
    status: "success",
    data: {
      departments,
    },
  });
});


exports.getDepartment = catchAsync(async (req, res, next) => {
  const department = await Department.findById(req.params.id)
    .populate("tickets")
    .populate("managers");
  if (!department)
    return next(new AppError("No Department Found with this ID!"));
  res.status(200).json({
    status: "success",
    data: {
      department,
    },
  });
});


exports.createDepartment = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  // const managers = await Employee.find({ _id: { $in: managerIds }, role: "manager" });
  // if (managers.length !== managerIds.length){
  //   return next(new AppError("Invalid Manager ID", 400));
  // }

  const department = await Department.create({ name });
  if (!department)
    return next(new AppError("Failed to create new Department!", 400));
  res.status(201).json({
    status: "success",
    data: {
      department,
    },
  });
});

exports.updateDepartment = catchAsync(async (req, res, next) => {

  const { managerIds, departmentId, ...rest } = req.body;
  if (managerIds) {
    const managers = await Employee.find({ _id: { $in: managerIds }, role: "manager" });

    if (managers.length !== managerIds.length) {
      return next(new AppError("Invalid Manager ID", 400));
    }
  }


  const department = await Department.findByIdAndUpdate(
    req.params.id,
    { ...rest, ...(managerIds && { $push: { managers: managerIds } }) },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!department)
    return next(new AppError("No document found with that ID", 400));

  await Employee.updateMany(
    { _id: managerIds }, // Filter for the managers to update
    { $push: { departmentsManaged: req.params.id } }, // Add departmentId to departmentsManaged
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: {
      department,
    },
  });
});

exports.deleteDepartment = catchAsync(async (req, res, next) => {
  const departmentId = req.params.id;

  // Find the department
  const department = await Department.findById(departmentId);
  if (!department) {
    return next(new AppError("No department found with this ID", 404));
  }

  await Promise.all([
    // Remove department reference from employees
    Employee.updateMany(
      { $or: [{ departmentsManaged: departmentId }, { departments: departmentId }] }, // Check both fields
      { $pull: { departmentsManaged: departmentId, departments: departmentId } } // Remove from both fields
    ),

    // Delete all tickets assigned to this department
    Ticket.deleteMany({ assignedTo: departmentId }),
  ]);

  // Now delete the department
  await department.deleteOne();

  res.status(204).json({
    status: "success",
    data: null,
  });
});
