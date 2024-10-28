const Ticket = require("../models/ticketModel");
const catchAsync = require("../utils/catchAsync");
// const Employee = require("../models/EmployeeModel");
// const Department = require("../models/departmentModel");
const AppError = require("../utils/AppError");
const multer = require("multer");
const fs = require("fs");
// const path = require("path");

const fileStorege = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.employee._id;
    console.log(userId);
    const dir = `./user_ticket/${userId}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/webp",
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Not a valid file type! Please upload only images or valid document types.",
        400
      ),
      false
    );
  }
};

const upload = multer({ storage: fileStorege, fileFilter });
exports.uploadedFile = upload.single("fileUploaded");
exports.getAllTickets = catchAsync(async (req, res) => {
  const tickets = await Ticket.find();

  res.status(200).json({
    status: "Success",
    results: tickets.length,
    data: {
      tickets,
    },
  });
});

//send tickets
exports.createTicket = catchAsync(async (req, res) => {
  const { title, description, assignedTo, fileUploaded } = req.body;
  console.log(req.file);
  const newTicket = await Ticket.create({
    title,
    description,
    assignedTo,
    createdBy: req.employee._id,
    fileUploaded: req.file.filename,
  });
  console.log(newTicket);
  if (!newTicket) return next(new AppError("Failed to create ticket"));

  res.status(201).json({
    success: true,
    message: "ticket created successfully",
    data: { newTicket },
  });
});

// //recieve tickets
// exports.recieveTickets = catchAsync(async (req, res) => {
//   const department = await Department.find({ manager: req.employee._id });
//   if (!department) return next(new AppError("can not find the department"));
//   const tickets = await Ticket.find({ assignedTo: department._id });

//   if (!tickets) return next(new AppError("failed to retrieve tickets"));

//   res.status(200).json({
//     success: "success",
//     data: tickets,
//   });
// });

exports.getTicket = catchAsync(async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return next(new AppError("No ticket found with this ID"));
  res.status(200).json({
    status: "success",
    data: {
      ticket,
    },
  });
});

//Manager Response
exports.respondToTicket = catchAsync(async (req, res, next) => {
  const { responseDescription, fileUploaded } = req.body; // Assuming description and file are in the request body

  const ticket = await Ticket.findOneAndUpdate(
    { _id: req.params.id },
    {
      response: {
        createdBy: req.employee._id,
        createdAt: Date.now(),
        description: responseDescription,
        fileUploaded,
      },
      status: "completed",
    },
    { new: true, runValidators: true } // Option to return the updated document
  );
  if (!ticket) return next(new AppError("Failed to send Response💥!"));
  res.status(200).json({
    status: "success",
    data: {
      ticket,
    },
  });
});
