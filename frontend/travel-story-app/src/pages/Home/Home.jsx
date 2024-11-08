import React, { useEffect, useState } from "react";
import Navbar from "../../cmponets/Navbar";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/AxiosInstance";
import { MdAdd } from "react-icons/md";
import Modal from "react-modal";
import TravelStorryCard from "../../cmponets/cards/TravelStorryCard";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddEditTravelStory from "./AddEditTravelStory";
import ViewTravelStory from "./ViewTravelStory";
import EmptyCard from "../../cmponets/cards/EmptyCard";

import EmptyImg from "../../assets/image/28805.jpg";
import { DayPicker } from "react-day-picker";
import moment from "moment";
import FilterInfoTitle from "../../cmponets/cards/FilterInfoTitle";
import { getEmptyCardMessage } from "../../utils/Helper";

const Home = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories] = useState([]);

  const [searchQuery, seTsearchQuery] = useState("");
  const [fileType, setFileType] = useState("");

  const [filterType, setFilterType] = useState("");

  const [dataRange, setDataRange] = useState({ from: null, to: null });

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [openViewModel, setOpenViewModel] = useState({
    isShown: false,
    data: null,
  });

  // Get User Info
  const getUserInfo = async () => {
    try {
      const responce = await axiosInstance.get("get-user");
      console.log(responce.data);

      if (responce.data && responce.data.user) {
        setUserInfo(responce.data.user);
      }
    } catch (error) {
      if (error.responce.status === 401) {
        // Clear storage if unauthorized
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  // Get All travel stories
  const getAllTravelStories = async () => {
    try {
      const responce = await axiosInstance.get("get-all-stories");

      if (responce.data && responce.data.stories) {
        setAllStories(responce.data.stories);
      }
    } catch (error) {
      console.log("An unxpexted error oucurred. please try again");
    }
  };

  // handele Edit Story Click
  const handeleEdit = (data) => {
    setOpenAddEditModal({ isShown: true, type: "edit", data: data });
  };

  // Handle Travel Story Click
  const handeleViewStory = (data) => {
    setOpenViewModel({ isShown: true, data });
  };

  // handele Update Favourite
  const updateIsFavourite = async (storyData) => {
    const storyId = storyData._id;

    try {
      const responce = await axiosInstance.put(
        "update-is-favourite/" + storyId,
        {
          isFavourite: !storyData.isFavourite,
        }
      );
      console.log(responce);

      if (responce.data && responce.data.story) {
        toast.success("Story Update Succeessfully");

        if (fileType === "search" && searchQuery) {
          onSearchStory(searchQuery);
        } else if (fileType === "date") {
          filterStoriesByDate(dataRange);
        } else {
          getAllTravelStories();
        }
      }
    } catch (error) {
      console.log("trvel story' An unxpexted error oucurred. please try again");
    }
  };

  // Delete Story
  const deleteTravelStory = async (data) => {
    const storyId = data._id;

    try {
      const responce = await axiosInstance.delete("/delete-story/" + storyId);
      console.log(responce);

      if (responce.data && responce.data.message) {
        toast.error("Story Delete Successfully");
        setOpenViewModel((prevState) => ({ ...prevState, isShown: false }));
        getAllTravelStories();
      }
    } catch (error) {
      //Henhel unexpectex erroe
      console.log("An unexpected error occurred. please try agin");
    }
  };

  // Search Story
  const onSearchStory = async (query) => {
    try {
      const responce = await axiosInstance.get("/search", {
        params: { query },
      });

      if (responce.data && responce.data.stories) {
        setFileType("seach");
        setAllStories(responce.data.stories);
      }
    } catch (error) {
      //Henhel unexpectex erroe
      console.log(error.message);
      console.log("An unexpected error occurred. please try agin");
    }
  };

  const handleClearSearch = () => {
    setFileType("");
    getAllTravelStories();
  };

  // Handle Filter Travel Story by date range
  const filterStoriesByDate = async (day) => {
    try {
      const startDate = day.from ? moment(day.from).valueOf() : null;
      const endDate = day.to ? moment(day.to).valueOf() : null;

      if (startDate && endDate) {
        const responce = await axiosInstance.get("/travel-stories/filter", {
          params: { startDate, endDate },
        });

        if (responce.data && responce.data.stories) {
          setFileType("date");
          setAllStories(responce.data.stories);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // handle Data Range Select
  const handleDayClick = (day) => {
    setDataRange(day);
    filterStoriesByDate(day);
  };

  const resetFilter = () => {
    setDataRange({ from: null, to: null });
    setFilterType("");
    getAllTravelStories();
  };

  useEffect(() => {
    getAllTravelStories();
    getUserInfo();
    return () => {};
  }, []);
  return (
    <>
      <Navbar
        userInfo={userInfo}
        searchQuery={searchQuery}
        setSearchQuery={(value) => seTsearchQuery(value)}
        onSearchNote={onSearchStory}
        handleClearSearch={handleClearSearch}
      />

      <div className="container mx-auto py-10">
        <FilterInfoTitle
          filterType={fileType}
          ilterDates={dataRange}
          onClear={() => {
            resetFilter();
          }}
        />

        <div className="flex gap-7">
          <div className="flex-1">
            {allStories.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {allStories.map((item) => {
                  return (
                    <TravelStorryCard
                      key={item._id}
                      imgUrl={item.imageUrl}
                      title={item.title}
                      story={item.story}
                      visitedLoction={item.visitedLoction}
                      date={item.visitedDate}
                      isFavourite={item.isFavourite}
                      // onEdit={() => handeleEdit(item)}
                      onClick={() => handeleViewStory(item)}
                      onFavouriteClick={() => updateIsFavourite(item)}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyCard
                imgSrc={EmptyImg}
                message1={getEmptyCardMessage(filterType)}
              />
            )}
          </div>
          <div className="w-[350px]">
            <div className="bg-white border border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg">
              <div className="p-3">
                <DayPicker
                  captionLayout="dropdown-buttond"
                  mode="range"
                  selected={dataRange}
                  onSelect={handleDayClick}
                  pagedNavigation
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*Add & Edit Travel Story Model */}
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroungColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="model-box"
      >
        <AddEditTravelStory
          storyInfo={openAddEditModal.data}
          type={openAddEditModal.type}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
          }}
          getAllTravelStories={getAllTravelStories}
        />
      </Modal>

      {/*View & Edit Travel Story Model */}
      <Modal
        isOpen={openViewModel.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroungColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="model-box"
      >
        <ViewTravelStory
          storyInfo={openViewModel.data || null}
          onClose={() => {
            setOpenViewModel((prevState) => ({ ...prevState, isShown: false }));
          }}
          onEditClick={() => {
            setOpenViewModel((prevState) => ({ ...prevState, isShown: false }));
            handeleEdit(openViewModel.data || null);
          }}
          onDeleteClick={() => {
            deleteTravelStory(openViewModel.data || null);
          }}
        />
      </Modal>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>
      <ToastContainer />
    </>
  );
};

export default Home;
