const validator = require("validator");
const mongoose = require("mongoose");
const Employee = require("../models/employeeModel.js");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Department = require("../models/departmentModel");
/**
 * @function getEmployees
 * @description Retrieves all employees from the database.
 * @route GET /api/employees
 * @returns {Object} JSON response with status "success", the count of employees, and an array of employee objects.
 */

exports.getEmployees = catchAsync(async (req, res, next) => {
  const employees = await Employee.find();
  res.status(200).json({
    status: "success",
    results: employees.length,
    data: {
      employees,
    },
  });
});

/**
 * @function createEmployee
 * @description Creates a new employee in the database, validating departments if provided.
 * @route POST /api/employees
 * @param {Object} req.body - The employee details including fname, lname, extensionsnumber, email, password, and an optional departments array.
 * @returns {Object} JSON response with status "success" and data containing the newly created employee.
 * @throws {AppError} If any department ID is invalid, it returns an error with a 400 status.
 */

exports.createEmployee = catchAsync(async (req, res, next) => {
  const { fname, lname, extensionsnumber, email, password, departments } =
    req.body;
  if (departments && departments.length === 0) {
    const validDepartments = await Department.find({
      _id: { $in: departments },
    });
    if (validDepartments.length !== departments.length) {
      return next(new AppError("Please provide a valid department", 400));
    }
  }
  const body = { fname, lname, extensionsnumber, email, password, departments };
  if (req.body.role) {
    body.role = req.body.role;
  }

  const employee = await Employee.create(body);
  res.status(201).json({
    status: "success",
    data: {
      employee,
    },
  });
});

//this is for inserting multiple employees all at once to a certain departement so try a request like this
// {
//   "departmentId": "614c1b8e8b9f6b4d5b528f70",
//   "employees": [
//     {
//       "fname": "xero",
//       "lname": "k",
//       "extensionsnumber": 8882,
//       "email": "XeroK@gmail.com",
//       "password": "1234567"
//     },
//     {
//       "fname": "Bob",
//       "lname": "booty",
//       "extensionsnumber": 8883,
//       "email": "bob@gmail.com",
//       "password": "1234567"
//     }
//   ]
// }

/**
 * @function createEmployees
 * @description Inserts multiple employees in a specific department in bulk.
 * @route POST /api/employees/bulk
 * @param {Array} req.body.employees - An array of employee objects to be inserted.
 * @param {string} req.body.departmentId - The ID of the department to associate all employees with.
 * @returns {Object} JSON response with status "success" and data containing the inserted employees.
 * @throws {AppError} If employees array is empty or not provided, it returns an error with a 400 status.
 */

exports.createEmployees = catchAsync(async (req, res, next) => {
  const { employees, departmentId } = req.body; //array of objects

  //check if the array is provided with valid fileds and if it's undefined or not
  if (!Array.isArray(employees) || employees.length === 0) {
    return next(
      new AppError("Invalid list!! please provide a list of employees", 400)
    );
  }

  const employeesWithDep = employees.map((employee) => ({
    ...employee,
    departments: [departmentId],
  }));

  const insertedEmployees = await Employee.insertMany(employeesWithDep);

  res.status(201).json({
    status: "Success",
    data: {
      insertedEmployees,
    },
  });
});

/**
 * @function getEmployee
 * @description Retrieves a specific employee by ID, populating their associated departments.
 * @route GET /api/employees/:id
 * @param {string} req.params.id - The ID of the employee.
 * @returns {Object} JSON response with status "success" and data containing the employee object.
 * @throws {Error} If no employee is found, it returns an error with message "No employee found with that ID".
 */

exports.getEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findOne({ _id: req.params.id }).populate({
    path: "departments",
  });
  if (!employee) {
    return next(new Error("No employee found with that ID"));
  }
  res.status(200).json({
    status: "success",
    data: {
      employee,
    },
  });
});

//New fn to get employee by extension number or email
exports.getEmployeeByEmailOrNummber = catchAsync(async (req, res, next) => {
  const { emailOrExtension } = req.body;

  if (!emailOrExtension) {
    return next(new Error("Email or extension number is required."));
  }

  const isEmail = validator.isEmail(emailOrExtension);
  const isFourDigitNumber =
    /^\d{4}$/.test(emailOrExtension) &&
    validator.isInt(emailOrExtension, { min: 0, max: 9999 });

  // Ensure that emailOrExtension is valid
  if (!isEmail && !isFourDigitNumber) {
    return next(new Error("Invalid email or extension number format."));
  }

  // let employee;
  // // Check if it's an email
  // const isEmail = emailOrExtension.includes("@");
  // // Check if it's an email
  // if (isEmail) {
  const employee = await Employee.findOne(
    isEmail
      ? { email: emailOrExtension }
      : { extensionsnumber: emailOrExtension }
  ).populate({
    path: "departments",
  });
  // }
  // // Check if it's an extension number (assuming it should be numeric)
  // else if (!isNaN(emailOrExtension) && emailOrExtension.length === 4) {
  //   employee = await Employee.findOne({
  //     extensionsnumber: emailOrExtension,
  //   }).populate({
  //     path: "departments",
  //   });
  // }

  if (!employee) {
    return next(new Error("No employee found with that ID"));
  }
  res.status(200).json({
    status: "success",
    data: {
      employee,
    },
  });
});

/**
 * @function updateEmployee
 * @description Updates an existing employee’s details by ID.
 * @route PATCH /api/employees/:id
 * @param {string} req.params.id - The ID of the employee to update.
 * @param {Object} req.body - The updated employee details.
 * @returns {Object} JSON response with status "success" and data containing the updated employee object.
 * @throws {Error} If no employee is found, it returns an error with message "No employee found with that ID". */

// exports.updateEmployee = catchAsync(async (req, res, next) => {
//   if (departmentsManaged && departmentsManaged.length > 0) {
//     // Ensure each department ID in departmentsManaged exists in the Department model
//     const validDepartments = await Department.find({
//       _id: { $in: departmentsManaged.map((id) => mongoose.Types.ObjectId(id)) },
//     });

//     if (validDepartments.length !== departmentsManaged.length) {
//       return next(new Error("One or more departments not found"));
//     }

//     // Update each department to add the employee's ID as a manager if not already added
//     await Promise.all(
//       validDepartments.map(async (department) => {
//         if (!department.managers.includes(req.params.id)) {
//           department.managers.push(req.params.id);
//           await department.save();
//         }
//       })
//     );
//   }
//   const employee = await Employee.findOneAndUpdate(
//     { _id: req.params.id },
//     req.body,
//     {
//       new: true,
//       runValidators: true,
//     }
//   );
//   if (!employee) {
//     return next(new Error("No employee found with that ID"));
//   }
//   res.status(200).json({
//     status: "success",
//     data: {
//       employee,
//     },
//   });
// });

/**
 * @function deleteEmployee
 * @description Deletes an employee by ID.
 * @route DELETE /api/employees/:id
 * @param {string} req.params.id - The ID of the employee to delete.
 * @returns {Object} JSON response with status "success" and data set to null.
 * @throws {Error} If no employee is found, it returns an error with message "No employee found with that ID".
 */

exports.deleteEmployee = catchAsync(async (req, res, next) => {
  const { emailOrExtension } = req.body;

  if (!emailOrExtension) {
    return next(new Error("Email or extension number is required."));
  }

  const isEmail = validator.isEmail(emailOrExtension);
  const isFourDigitNumber =
    /^\d{4}$/.test(emailOrExtension) &&
    validator.isInt(emailOrExtension, { min: 0, max: 9999 });

  // Ensure that emailOrExtension is valid
  if (!isEmail && !isFourDigitNumber) {
    return next(new Error("Invalid email or extension number format."));
  }

  // let employee;
  // // Check if it's an email
  // const isEmail = emailOrExtension.includes("@");
  // // Check if it's an email
  // if (isEmail) {
  const employee = await Employee.findOneAndDelete(
    isEmail
      ? { email: emailOrExtension }
      : { extensionsnumber: emailOrExtension }
  );

  // const employee = await Employee.findOneAndDelete({ _id: req.params.id });
  if (!employee) {
    return next(new Error("No employee found with that ID"));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

/////////////////////////////////////////////////
//New Update Function

exports.updateEmployeeDeps = catchAsync(async (req, res, next) => {
  const { departmentsManaged, emailOrExtension } = req.body;
  // Check if emailOrExtension exists
  if (!emailOrExtension) {
    return next(new Error("Email or extension number is required."));
  }

  const isEmail = validator.isEmail(emailOrExtension);
  const isFourDigitNumber =
    /^\d{4}$/.test(emailOrExtension) &&
    validator.isInt(emailOrExtension, { min: 0, max: 9999 });

  // Ensure that emailOrExtension is valid
  if (!isEmail && !isFourDigitNumber) {
    return next(new Error("Invalid email or extension number format."));
  }
  if (departmentsManaged && departmentsManaged.length > 0) {
    // Ensure each department ID in departmentsManaged exists in the Department model
    const validDepartments = await Department.find({
      _id: {
        $in: departmentsManaged.map((id) => new mongoose.Types.ObjectId(id)),
      },
    });

    if (validDepartments.length !== departmentsManaged.length) {
      return next(new Error("One or more departments not found"));
    }

    // Fetch the employee's current departmentsManaged for comparison
    const employee = await Employee.findOne(
      isEmail
        ? { email: emailOrExtension }
        : { extensionsnumber: emailOrExtension }
    );
    if (!employee) {
      return next(new Error("No employee found with that ID"));
    }

    const oldDepartments = employee.departmentsManaged || [];
    const newDepartments = departmentsManaged.map((id) => id.toString());

    // Remove the employee's ID as a manager from departments they are no longer managing
    const departmentsToRemoveManager = oldDepartments.filter(
      (deptId) => !newDepartments.includes(deptId.toString())
    );

    await Department.updateMany(
      { _id: { $in: departmentsToRemoveManager } },
      { $pull: { managers: employee._id } }
    );

    // Add the employee's ID as a manager to the new departments
    await Department.updateMany(
      { _id: { $in: newDepartments } },
      { $addToSet: { managers: employee._id } }
    );

    // Update the employee's departmentsManaged field
    employee.departmentsManaged = newDepartments;
    employee.departments = newDepartments;
    const updatedEmployee = await employee.save();

    res.status(200).json({
      status: "success",
      data: {
        employee: updatedEmployee,
      },
    });
  }
});

exports.updateEmployee = catchAsync(async (req, res, next) => {
  const { fname, lname, extensionsnumber, email } = req.body;

  // Proceed with any other employee updates
  const updatedEmployee = await Employee.findOneAndUpdate(
    { _id: req.params.id },
    { fname, lname, extensionsnumber, email },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      employee: updatedEmployee,
    },
  });
});
