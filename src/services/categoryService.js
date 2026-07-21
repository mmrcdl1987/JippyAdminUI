import { FM_API } from "./api";

// export const getAllCategories = async () => {
//   const response = await FM_API.get("/api/fm/getHomeOrAllCategories?filter=ALL");
//   return response.data;
// };


//=======get all categories=========


export const getHomeOrAllCategories = async (filter) => {
  return await FM_API.get(
    `/api/fm/getHomeOrAllCategories?filter=${filter}`
  );
};


//========create category=======

export const createCategory = async (categoryData) => {

  const response = await FM_API.post(
    "/api/fm/createCategory",
    categoryData
  );

  return response.data;

};