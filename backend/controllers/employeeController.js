const Employee = require("../models/employeeModel.js");
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/AppError') 
const Department = require('../models/departmentModel')

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

exports.createEmployee = catchAsync(async (req, res, next) => {
  const { fname, lname, extensionsnumber, email, password, departments } =
    req.body;
  if(departments && departments.length === 0){
    const validDepartments = await Department.find({
      _id: { $in: departments }
    })
    if(validDepartments.length !== departments.length){
      return next(new AppError("Please provide a valid department", 400))
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


exports.createEmployees = catchAsync(async(req , res ,next)=>{
  const {employees , departmentId} = req.body //array of objects

  //check if the array is provided with valid fileds and if it's undefined or not
  if(!Array.isArray(employees) || employees.length ===0){
    return next(new AppError('Invalid list!! please provide a list of employees' , 400))
  }


  const employeesWithDep = employees.map(employee=>({
    ...employee,
    departments: [departmentId]
  }))


  const insertedEmployees = await Employee.insertMany(employeesWithDep)


  res.status(201).json({
    status: 'Success',
    data:{
      insertedEmployees
    }
  })
})



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
exports.updateEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
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
exports.deleteEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findOneAndDelete({ _id: req.params.id });
  if (!employee) {
    return next(new Error("No employee found with that ID"));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
