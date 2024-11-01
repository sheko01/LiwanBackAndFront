const Ticket = require("../models/ticketModel");
const catchAsync = require("../utils/catchAsync");
// const Employee = require("../models/EmployeeModel");
// const Department = require("../models/departmentModel");
const AppError = require("../utils/AppError");
const { notifyClients } = require("./sseController");
const multer = require("multer");
const fs = require("fs");
const cron = require("node-cron");
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

/**
 * Create a New Ticket
 * Creates a new ticket with details from the request body.
 * - Required: `title`, `description`, `assignedTo`, `fileUploaded`
 * - Notifies clients of a "new-ticket" event.
 * - Response: Status 201, success message, and created ticket data.
 */

//send tickets
exports.createTicket = catchAsync(async (req, res, next) => {
  const { title, description, assignedTo, fileUploaded } = req.body;

  console.log(req.employee._id);

  const newTicket = await Ticket.create({
    title,
    description,
    assignedTo,
    createdBy: req.employee._id,
    fileUploaded,
  });
  console.log(newTicket);
  if (!newTicket) return next(new AppError("Failed to create ticket"));

  notifyClients("new-ticket", newTicket);

  res.status(201).json({
    success: true,
    message: "ticket created successfully",
    data: { newTicket },
  });
});

const deleteOldTickets = async () => {
  const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  await Ticket.deleteMany({
    status: "completed",
    createdAt: { $lt: threeMonthsAgo },
  });
  console.log("Old completed tickets deleted");
};

/**
 * Get a Ticket by ID
 * Retrieves a single ticket based on its ID.
 * - Required: Ticket ID in request parameters.
 * - Response: Status 200 with ticket data, or error if not found.
 */

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

exports.getTicketCreatedBy = catchAsync(async (req, res, next) => {
  const empId = req.params.id;

  //Getting all tickets created by the user
  const tickets = await Ticket.find({ createdBy: empId });

  res.status(200).json({
    status: "Success",
    results: tickets.length,
    data: {
      tickets,
    },
  });
});

exports.getMyTickets = catchAsync(async (req, res, next) => {
  const empId = req.employee._id;
  // Getting all tickets created by the user (employee)
  const tickets = await Ticket.find({ createdBy: empId });

  if (!tickets) {
    return next(new AppError("No tickets found for this user", 404));
  }

  res.status(200).json({
    status: "Success",
    results: tickets.length,
    data: {
      tickets,
    },
  });
});

/**
 * Respond to a Ticket
 * Allows a manager to respond to a ticket, updating its status to "completed" and adding a response.
 * - Required: Ticket ID in request parameters, `responseDescription`, and `fileUploaded` in request body.
 * - Notifies clients of a "ticket-response" event.
 * - Response: Status 200 with updated ticket data, or error if update fails.
 */

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

  notifyClients("ticket-response", ticket);

  res.status(200).json({
    status: "success",
    data: {
      ticket,
    },
  });
});

/**
 * Get Tickets With Response
 * Retrieves all tickets that have a response object.
 * - Response: Status 200 with filtered tickets data
 */
exports.getTicketsWithResponse = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find({
    response: { $exists: true, $ne: null },
  });

  res.status(200).json({
    status: "Success",
    results: tickets.length,
    data: {
      tickets,
    },
  });
});

/**
 * Get Tickets Without Response
 * Retrieves all tickets that don't have a response object.
 * - Response: Status 200 with filtered tickets data
 */
exports.getTicketsWithoutResponse = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find({
    $or: [{ response: { $exists: false } }, { response: null }],
  });

  res.status(200).json({
    status: "Success",
    results: tickets.length,
    data: {
      tickets,
    },
  });
});

/**
 * Get Tickets By Date Range and Response Status
 * Retrieves tickets filtered by date range and optionally by response status
 * Query params:
 * - startDate (optional): Start date in YYYY-MM-DD format
 * - endDate (optional): End date in YYYY-MM-DD format
 * - hasResponse (optional): 'true' or 'false'
 */
exports.getFilteredTickets = catchAsync(async (req, res, next) => {
  // Get query parameters
  const { startDate, endDate, hasResponse } = req.query;

  // Build filter object
  let filterOptions = {};

  // Add date range if provided
  if (startDate || endDate) {
    filterOptions.createdAt = {};

    if (startDate) {
      filterOptions.createdAt.$gte = new Date(startDate);
    }

    if (endDate) {
      // Set time to end of day for endDate
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filterOptions.createdAt.$lte = endDateTime;
    }
  }

  // Add response filter if provided
  if (hasResponse !== undefined) {
    if (hasResponse === "true") {
      filterOptions.response = { $exists: true, $ne: null };
    } else if (hasResponse === "false") {
      filterOptions.$or = [
        { response: { $exists: false } },
        { response: null },
      ];
    }
  }

  // Find tickets with filters
  const tickets = await Ticket.find(filterOptions).sort({ createdAt: -1 }); // Sort by newest first

  res.status(200).json({
    status: "Success",
    results: tickets.length,
    data: {
      tickets,
    },
  });
});

/**
 * Get Today's Tickets
 * Retrieves all tickets created today
 * Query params:
 * - hasResponse (optional): 'true' or 'false'
 */
exports.getTodayTickets = catchAsync(async (req, res, next) => {
  const { hasResponse } = req.query;

  // Get today's start and end
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let filterOptions = {
    createdAt: {
      $gte: today,
      $lt: tomorrow,
    },
  };

  // Add response filter if provided
  if (hasResponse === "true") {
    filterOptions.response = { $exists: true, $ne: null };
  } else if (hasResponse === "false") {
    filterOptions.$or = [{ response: { $exists: false } }, { response: null }];
  }

  const tickets = await Ticket.find(filterOptions).sort({ createdAt: -1 });

  res.status(200).json({
    status: "Success",
    results: tickets.length,
    data: {
      tickets,
    },
  });
});

/**
 * Get Tickets Sorted By Date (Ascending)
 * Retrieves all tickets sorted from oldest to newest
 */
exports.getTicketsByDateAsc = catchAsync(async (req, res, next) => {
  const tickets = await Ticket.find()
    .sort({ createdAt: 1 }) // 1 for ascending order (oldest first)
    .populate([
      {
        path: "createdBy",
        select: "fname lname fullName",
      },
      {
        path: "assignedTo",
        select: "name",
      },
    ]);

  if (!tickets) {
    return next(new AppError("No tickets found", 404));
  }

  res.status(200).json({
    status: "Success",
    results: tickets.length,
    data: {
      tickets,
    },
  });
});

cron.schedule("* * * * *", deleteOldTickets);
