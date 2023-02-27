const Media = require("../models/Media")
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cloudinary = require("cloudinary");

//====================================== CREATE FUNCTION ======================================

// admin operations
const createMedia = catchAsyncErrors(async (req, res) => {
  
    let dataArray = [{name: "", imageData: ""}]
    dataArray = req.body

    for(let i = 0; i<dataArray.length; i++){
        const myCloud = await cloudinary.v2.uploader.upload(dataArray[i].imageData, {
            folder: "Products",
            width: 150,
            crop: "scale",
            resource_type: "auto",
          });
        
        
          await Media.create({
            name: dataArray[i].name,
            url: myCloud.url,
            public_id: myCloud.public_id
          });
        
    }

  
  const media = await Media.find()
  const mediaCount = await Media.countDocuments()

  res.status(201).json({ success: true, media, mediaCount, newImageCount: dataArray.length });
});

//====================================== DELETE FUNCTIONS ======================================

const deleteMedia = catchAsyncErrors(async (req, res, next) => {
  const image = await Media.findByIdAndDelete(req.params.id);
  if (!image) {
    return next(new ErrorHandler(`Image ${req.params.id} not found`, 404));
  }
  

  const media = await Media.find();
  const mediaCount = await Media.countDocuments();

  res.status(200).json({ success: true, media, mediaCount });
});


//====================================== GET FUNCTIONS ======================================

const getAllMedia = catchAsyncErrors(async (req, res) => {
  const mediaCount = await Media.countDocuments();

  const media = await Media.find();

  if (!media) {
    return next(new ErrorHandler(`media not found`, 404));
  }

  res.status(200).json({ succes: true, media, mediaCount });
});

module.exports = {
    createMedia,
    deleteMedia,
    getAllMedia
};
