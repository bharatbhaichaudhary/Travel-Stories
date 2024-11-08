import React, { useState } from "react";
import { MdAdd, MdClose, MdDeleteOutline, MdUpdate } from "react-icons/md";
import DateSelector from "../../cmponets/input/DateSelector";
import ImageSelector from "../../cmponets/input/ImageSelector";
import TagTnput from "../../cmponets/input/TagTnput";
import axiosInstance from "../../utils/AxiosInstance";
import moment from "moment";
import { toast } from "react-toastify";
import uploadImage from "../../utils/UploadImage";

const AddEditTravelStory = ({
  storyInfo,
  type,
  onClose,
  getAllTravelStories,
}) => {
  const [title, setTitle] = useState(storyInfo?.title || "");
  const [storyImg, setStoryImg] = useState(storyInfo?.imageUrl || null);
  const [story, setStory] = useState(storyInfo?.story || "");
  const [visitedLoction, setVisitedLoction] = useState(
    storyInfo?.visitedLoction || []
  );
  const [visitedDate, setVisitedDate] = useState(
    storyInfo?.visitedDate || null
  );

  const [error, setError] = useState("");

  // Add New Travel Story
  const addNewTravelStory = async () => {
    try {
      let imageUrl = "";

      // Uplosd image if present
      if (storyImg) {
        const imgUploadRes = await uploadImage(storyImg);

        // Get Image Url
        imageUrl = imgUploadRes.imageUrl || "";
      }

      const responce = await axiosInstance.post("/add-travel-story", {
        title,
        story,
        imageUrl: imageUrl || "",
        visitedLoction,
        visitedDate: visitedDate
          ? moment(visitedDate).valueOf()
          : moment().valueOf(),
      });
      console.log(responce);

      if (responce.data && responce.data.story) {
        toast.success("Story Added Successfully");
        // Refresh stories
        getAllTravelStories();
        // Close modal or from
        onClose();
      }
    } catch (error) {
      if (
        error.responce &&
        error.responce.data &&
        error.responce.data.message
      ) {
        setError(error.responce.data.message);
      } else {
        //Henhel unexpectex erroe
        setError("An unexpected error occurred. please try agin");
      }
    }
  };

  // Update Travel Story
  const updateTravelStory = async () => {
    const storyId = storyInfo._id;
    try {
      let imageUrl = "";

      let postData = {
        title,
        story,
        imageUrl: storyInfo.imageUrl || "",
        visitedLoction,
        visitedDate: visitedDate
          ? moment(visitedDate).valueOf()
          : moment().valueOf(),
      };

      if (typeof storyImg === "object") {
        // Upload New image
        const imhUploadRes = await uploadImage(storyImg);
        imageUrl = imhUploadRes.imageUrl || "";

        postData = {
          ...postData,
          imageUrl: imageUrl,
        };
      }

      const responce = await axiosInstance.put(
        "/edit-story/" + storyId,
        postData
      );
      console.log(responce);

      if (responce.data && responce.data.story) {
        toast.success("Story Updatet Successfully");
        // Refresh stories
        getAllTravelStories();
        // Close modal or from
        onClose();
      }
    } catch (error) {
        console.log(error);
      if (
        error.responce &&
        error.responce.data &&
        error.responce.data.message
      ) {
        setError(error.responce.data.message);
      } else {
        //Henhel unexpectex erroe
        setError("An unexpected error occurred. please try agin");
      }
    }
  };

  const handleAddOrUpdateClick = () => {
    console.log("Input Data", {
      title,
      storyImg,
      story,
      visitedLoction,
      visitedDate,
    });

    if (!title) {
      setError("Please enter the title");
      return;
    }
    if (!story) {
      setError("Please enter the story");
      return;
    }

    setError("");

    if (type === "edit") {
      updateTravelStory();
    } else {
      addNewTravelStory();
    }
  };

  // Delete story image and Update the story
  const handleDeleteImg = async () => {
    // Deleting the image
    const deleteImageRes = await axiosInstance.delete("/delete-image", {
      params: {
        imageUrl: storyInfo.imageUrl,
      },
    });
    if(deleteImageRes.data){
        const storyId = storyInfo._id

        const postData = {
            title,
            story,
            visitedLoction,
            visitedDate: moment().format(),
            imageUrl:""
        }
        // Updating story 
        const responce = await axiosInstance.put("/edit-story" + storyId, postData)
        setStoryImg(null)
    }
  };
  return (
    <div className="relative">
      <div className="flex to-current justify-between">
        <h5 className="text-xl font-medium text-slate-800">
          {type === "add" ? "Add Story" : "Upadte Story"}
        </h5>

        <div>
          <div className="flex items-center gap-3 bg-cyan-50/100 p-2 rounded-l-lg">
            {type === "add" ? (
              <button className="btn-small" onClick={handleAddOrUpdateClick}>
                <MdAdd className="text-lg" /> ADD STORY
              </button>
            ) : (
              <>
                <button className="btn-small" onClick={handleAddOrUpdateClick}>
                  <MdUpdate className="text-lg" /> UPDATE STORY
                </button>

                {/* <button className="btn-small btn-delete" onClick={onClose}>
                  <MdDeleteOutline className="text-lg" /> DELETE
                </button> */}
              </>
            )}

            <button className="" onClick={onClose}>
              <MdClose className="text-xl" />
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-xs pt-2 text-right">{error}</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex-1 flex flex-col gap-2 pt-4">
          <label className="input-label">TITLE</label>
          <input
            type="text"
            className="text-2xl text-slate-950 outline-none bg-white"
            placeholder="A Day the Great Wall"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />

          <div className="my-3">
            <DateSelector date={visitedDate} setDate={setVisitedDate} />
          </div>

          <ImageSelector
            image={storyImg}
            setImage={setStoryImg}
            handleDeleteImg={handleDeleteImg}
          />

          <div className="flex flex-col gap-2 mt-4">
            <label className="input-labrl">STORY</label>
            <textarea
              type="text"
              className="text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded"
              placeholder="Your Story"
              value={story}
              rows={8}
              onChange={({ target }) => setStory(target.value)}
            />
          </div>

          <div className="pt-3">
            <label className="input-lable">VISITED LOCATIONS</label>
            <TagTnput tags={visitedLoction} setTags={setVisitedLoction} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditTravelStory;
