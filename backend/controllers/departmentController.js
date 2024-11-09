const catchAsync = require("../utils/catchAsync");
const Department = require("../models/departmentModel");
const Employee = require("../models/employeeModel");
const AppError = require("../utils/AppError");
const Ticket = require("../models/ticketModel");

/**
 * @function getAllDepartments
 * @description Retrieves all departments from the database.
 * @route GET /api/departments
 * @returns {Object} JSON response with status "success" and data containing an array of departments.
 * @throws {AppError} If no departments are found, returns an error with message "No Departments Found!".
 */

exports.getAllDepartments = catchAsync(async (req, res, next) => {
  const departments = await Department.find();
  if (!departments) return next(new AppError("No Departments Found!"));
  res.status(200).json({
    status: "success",
    results: departments.length,
    data: {
      departments,
    },
  });
});

/**
 * @function getDepartment
 * @description Retrieves a single department by its ID, populating the related tickets and managers.
 * @route GET /api/departments/:id
 * @param {string} id - The department ID from the route parameters.
 * @returns {Object} JSON response with status "success" and data containing the department object.
 * @throws {AppError} If no department is found, returns an error with message "No Department Found with this ID!".
 */

exports.getDepartment = catchAsync(async (req, res, next) => {
  if (
    !req.employee.departmentsManaged.includes(req.params.id) &&
    req.employee.role !== "admin"
  ) {
    return next(new AppError("You do not have access to this Department", 403));
  }
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

/**
 * @function createDepartment
 * @description Creates a new department with the provided name.
 * @route POST /api/departments
 * @param {string} name - The name of the new department, provided in the request body.
 * @returns {Object} JSON response with status "success" and data containing the created department object.
 * @throws {AppError} If creation fails, returns an error with message "Failed to create new Department!" and status code 400.
 */

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

/**
 * @function updateDepartment
 * @description Updates an existing department, optionally adding managers.
 * @route PATCH /api/departments/:id
 * @param {Array} managerIds - (Optional) An array of manager IDs to associate with the department, provided in the request body.
 * @returns {Object} JSON response with status "success" and data containing the updated department object.
 * @throws {AppError} If no department is found with the given ID, returns an error with message "No document found with that ID" and status code 400.
 */

exports.updateDepartment = catchAsync(async (req, res, next) => {
  const { managerIds, departmentId, ...rest } = req.body;
  if (managerIds) {
    const managers = await Employee.find({
      _id: { $in: managerIds },
      role: "manager",
    });

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

/**
 * @function deleteDepartment
 * @description Deletes a department and removes references from associated employees and tickets.
 * @route DELETE /api/departments/:id
 * @param {string} id - The department ID from the route parameters.
 * @returns {Object} JSON response with status "success" and data set to null.
 * @throws {AppError} If no department is found with the given ID, returns an error with message "No department found with this ID" and status code 404.
 */

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
      {
        $or: [
          { departmentsManaged: departmentId },
          { departments: departmentId },
        ],
      }, // Check both fields
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
