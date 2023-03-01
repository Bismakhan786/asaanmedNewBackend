const Media = require("../models/Media");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const cloudinary = require("cloudinary");

//====================================== CREATE FUNCTION ======================================

// admin operations
const createMedia = catchAsyncErrors(async (req, res) => {
  let dataArray = [{ name: "", imageData: "" }];
  dataArray = req.body;

  for (let i = 0; i < dataArray.length; i++) {
    const myCloud = await cloudinary.v2.uploader.upload(
      dataArray[i].imageData,
      {
        folder: "Products",
        width: 150,
        crop: "scale",
        resource_type: "auto",
      }
    );

    await Media.create({
      name: dataArray[i].name,
      url: myCloud.url,
      public_id: myCloud.public_id,
    });
  }

  const media = await Media.find();
  const mediaCount = await Media.countDocuments();

  res
    .status(201)
    .json({
      success: true,
      media,
      mediaCount,
      newImageCount: dataArray.length,
    });
});

//====================================== DELETE FUNCTIONS ======================================

const deleteMedia = catchAsyncErrors(async (req, res, next) => {
  const image = await Media.findById(req.params.id)
  
  if (!image) {
    return next(new ErrorHandler(`Image ${req.params.id} not found`, 404));
  }

  const myCloudResult = await cloudinary.v2.uploader.destroy(
    image.public_id,
    {
      resource_type: "image",
    }
  );

  if(myCloudResult.result !== "ok"){
    return next(new ErrorHandler(`Image can't be deleted from cloudinary`, 404));

  }

  await image.remove()

  const media = await Media.find();
  const mediaCount = await Media.countDocuments();

  res.status(200).json({ success: true, media, mediaCount });
});

const deleteAllMedia = catchAsyncErrors(async (req, res, next) => {
  const media = await Media.find();

  const deletedCount = await Media.countDocuments();
  media.forEach(async (media) => {
    const myCloudResult = await cloudinary.v2.uploader.destroy(
      media.public_id,
      {
        resource_type: "image",
      }
    );
  
    if(myCloudResult.result !== "ok"){
      return next(new ErrorHandler(`Image can't be deleted from cloudinary`, 404));
  
    }
  
    await media.remove()
  });

  res
    .status(200)
    .json({
      success: true,
      media,
      deletedCount,
      message: `Successfully deleted all the media`,
    });
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
  getAllMedia,
  deleteAllMedia,
};
