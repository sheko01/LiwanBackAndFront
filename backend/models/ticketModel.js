const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Ticket must has Title !"],
    },
    description: {
      type: String,
      required: [true, "Ticket must has Description !"],
    },
    createdBy: {
      type: mongoose.Schema.ObjectId, //employee ID
      ref: "Employee",
    },
    assignedTo: {
      type: mongoose.Schema.ObjectId, //Department ID
      ref: "Department",
      required: [true, "Ticket must has Assigned To !"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    status: {
      type: String,
      enum: {
        values: ["completed", "pending"],
      },
      default: "pending",
    },
    response: {
      createdBy: {
        type: mongoose.Schema.ObjectId, //manager ID
        ref: "Employee",
      },
      createdAt: {
        type: Date,
      },
      description: {
        type: String,
      },
      fileUploaded: String,
    },
    fileUploaded: {
      type: String,
      required: [true, "Ticket must has File Uploaded !"],
    },
    hidden: { type: Boolean, default: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);
ticketSchema.pre(/^find/, function (next) {
  this.populate({ path: "assignedTo", select: "name" })
    .populate({ path: "createdBy", select: "fname lname" })
    .populate({ path: "response.createdBy", select: "fname lname" });
  next();
});
const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
