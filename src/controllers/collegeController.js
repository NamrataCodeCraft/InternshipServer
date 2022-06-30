const collegeModel = require("../models/collegeModel");
const internModel = require("../models/internModel");
const { default: mongoose } = require("mongoose");

//////===================+==+==+==[Validation Functions]==+==+==+==+======================///////

// const isValid = function (value) {
//   if (typeof value === "undefined" || value === null) return false;
//   if (typeof value === "string" && value.trim().length === 0) return false;
//   if (typeof value === Number && value.trim().length === 0) return false;
//   return true;
// };
//==+==+==+==+==+==+==+==+==+==[Create College]==+==+==+==+==+==+==+==+==+==//

const createCollege = async function (req, res) {
  try {
    let data = req.body;
    let { name, fullName, logoLink } = data;

    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, msg: "Data is required" });
    }
    //---------------checking whether all the required inputs are given or not------------------------------------------///
    if (!name) {
      return res.status(400).send({ status: false, msg: "Name field is missing" });
    }
    if (!fullName) {
      return res.status(400).send({ status: false, msg: "Full name field is missing" });
    }
    if (!logoLink) {
      return res.status(400).send({ status: false, msg: "Logolink  field is missing" });
    }
    //------------------------------checking the Validation of the inputs-------------------------------------//
    if (!/^[a-zA-Z_-]+$/.test(name)) {
      return res.status(400).send({ status: false, msg: "Enter valid name" });
    }
    
    if (!/^[a-zA-Z_ ]+$/.test(fullName)) {
      return res.status(400).send({ status: false, msg: "Enter valid Full name" });
    }
    if (!/(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/.test(logoLink)) {
      return res.status(400).send({ status: false, msg: "Enter a valid logolink." });
    }
    // ---------[Checking whether unique attributes are present in the DB or not]-----------
 

    let getCollegeName = await collegeModel.findOne({ name })
    if (getCollegeName) {
      res.status(400).send({ status: false, msg: `${name} is already listed` })
    }
    ///========================creating college with the given inputs=============================//////

    let collegeData = await collegeModel.create(data);
    
    let Data= await collegeModel.find(collegeData).select({name:1,fullName:1,logoLink:1,isDeleted:1,_id:0})
    res.status(201).send({ status: true, msg: "College Created successfully", data:Data, });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

const collegeDetails = async function (req, res) { 

  let collegeName = req.query.collegeName;

  ///=========================checking whether the required inputs are given or not======================/////

  if (!collegeName) {
    return res.status(400).send({ status: false, msg: "Collegename is required." });
  }
  ////========================finding the college document with the college name==================//////

  let collegeDetails = await collegeModel.findOne({ name: collegeName });
  if (!collegeDetails) {
    return res.status(400).send({ status: false, msg: "Collegename is not listed." });
  }
  //========================finding the intern document with the college document id========================/////

  let internDetails = await internModel.find({ collegeId: collegeDetails._id }).select({ name: 1, email: 1, mobile: 1, _id: 1 });
  if (internDetails.length==0) { return res.status(400).send({ status: false, msg: "No intern has applied for this college." }) }
  let result = {
    name: collegeDetails.name,
    fullName: collegeDetails.fullName,
    logoLink: collegeDetails.logoLink,
    interns: internDetails,
  };
  res.status(200).send({ status: true, data: result });
};

module.exports = { createCollege, collegeDetails };