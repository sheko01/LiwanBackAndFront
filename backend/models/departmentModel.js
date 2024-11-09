const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "Missing Department Name"],
    },
    managers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Employee",
      }, // Foreign Key
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);
departmentSchema.virtual("tickets", {
  //ref => reference to the Ticket model
  ref: "Ticket",
  //foreignField => the foreign key in the Ticket model
  foreignField: "assignedTo",
  //localField => the key in dep that we use as foreign key in Ticket model
  localField: "_id",
});
//middleware qurey to populate mananger for every department
departmentSchema.pre(/^find/, function (next) {
  // this.populate({ path: "manager", select: "fullName" });
  this.populate({ path: "managers", select: "fname lname" });
  next();
});
const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;
