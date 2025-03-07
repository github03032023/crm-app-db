const userModel = require("../model/UserModel");

module.exports = {
    addUser: (req, res) => {
        try {
            const { name, username, email, age, gender, location } = req.body;
            console.log("Request Body is -", req?.body)

            if (name && username && email && age) {
                const newUser = new userModel({
                    name,
                    username,
                    email,
                    age,
                    gender,
                    location
                });
                newUser.save()
                    .then((response) => {
                        console.log("response: ", response);

                        return res.status(201).json({
                            success: true,
                            statusCode: 201,
                            message: "User added successfully",
                        });
                    })
                    .catch((error) => {
                        console.log("error: ", error);

                        if (error?.code === 11000) {
                            return res.status(200).json({
                                success: false,
                                statusCode: 400,
                                message: "User with same name already exists!"
                            });
                        } else {
                            return res.status(200).json({
                                success: false,
                                statusCode: 400,
                                message: "User adding failed"
                            });
                        }
                    })
            } else {
                return res.status(200).json({
                    success: false,
                    statusCode: 400,
                    message: "Missing required fields"
                });
            }

        } catch (err) {
            res.status(500).json({
                success: false,
                statusCode: 500,
                message: "Internal Server Error"
            });
        }
    },
    
    getUsers: async (req, res) => {
        try {
            // Extract query parameters for filtering, Pagination done with page and limit
            const { name, email, location, age, gender, page = 1, limit = 10 } = req.query;
             /*
                         Build the $match filter dynamically based on the request parameters for example
                         http://localhost:5000/api/getUsers?age=12&page=1&limit=5&token=ValidToken  (filter based on age)
                         http://localhost:5000/api/getUsers?age=12&token=ValidToken&location=US&page=1&limit=5 (filter based on location)
            
            */


            // Convert page and limit to numbers
            const pageNumber = parseInt(page);
            const pageSize = parseInt(limit);
            const skip = (pageNumber - 1) * pageSize;

            // Build the $match filter dynamically
            let matchStage = {};

            if (name) matchStage.name = { $regex: new RegExp(name, "i") };
            if (email) matchStage.email = { $regex: new RegExp(email, "i") };
            if (location) matchStage.location = { $regex: new RegExp(location, "i") };
            if (age) matchStage.age = { $gte: parseInt(age) };
            if (gender) matchStage.gender = gender;

            // Use aggregation pipeline for filtering, pagination, and sorting
            const users = await userModel.aggregate([
                { $match: matchStage },  // Filtering conditions
                { $sort: { gender: 1 } }, // Sorting (optional)
                { $skip: skip },  // Skip previous pages' results
                { $limit: pageSize } // Limit results per page
            ]);

            // Get total count of filtered users
            const totalUsers = await userModel.countDocuments(matchStage);

            console.log("Users-", users);
            res.status(200).json({
                success: true,
                statusCode: 200,
                message: "Users fetched successfully",
                count: users.length,
                totalUsers,
                totalPages: Math.ceil(totalUsers / pageSize),
                currentPage: pageNumber,
                data: users
            });

        } catch (err) {
            console.log("error: ", err);
            res.status(500).json({
                success: false,
                statusCode: 500,
                message: "Internal Server Error"
            });
        }
    },





    updateUser: (req, res) => {
        try {
            const { userName, updatedData } = req.body;

            if (userName) {
                userModel.updateOne(
                    { username: userName },
                    updatedData
                ).then((response) => {
                    console.log("response: ", response);

                    return res.status(200).json({
                        success: true,
                        statusCode: 200,
                        message: "User updated successfully"
                    });
                })
                    .catch((err) => {
                        console.log("err: ", err);
                        return res.status(200).json({
                            success: false,
                            statusCode: 400,
                            message: "User updation failed",
                            error: err
                        });
                    })

            } else {
                return res.status(200).json({
                    success: false,
                    statusCode: 400,
                    message: "Missing required fields"
                });
            }

        } catch (err) {
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: "Internal Server Error"
            })
        }
    },
    // soft_delete method
    deleteUser: (req, res) => {
        try {
            const { userName } = req.query;

            if (userName) {
                userModel.updateOne(
                    { username: userName },
                    {
                        $set: {
                            isDeleted: true
                        }
                    }
                ).then((response) => {
                    if (response?.modifiedCount != 0) {
                        return res.status(200).json({
                            success: true,
                            statusCode: 200,
                            message: "User deleted successfully"
                        });
                    } else {
                        return res.status(200).json({
                            success: false,
                            statusCode: 400,
                            message: "User deletion failed",
                            error: err
                        });
                    }
                }).catch(err => {
                    console.log("err: ", err);
                    return res.status(200).json({
                        success: false,
                        statusCode: 400,
                        message: "User deletion failed",
                        error: err
                    });
                })

            } else {
                return res.status(200).json({
                    success: false,
                    statusCode: 400,
                    message: "Missing required fields"
                });
            }

        } catch (err) {
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: "Internal Server Error"
            })
        }
    },
    // hard_delete method
    deleteUserFromDatabase: async (req, res) => {
        try {
            const { userName } = req.query;

            if (userName) {
                const response = await userModel.deleteOne({ username: userName });
                if (response.deletedCount != 0) {
                    return res.status(200).json({
                        success: true,
                        statusCode: 200,
                        message: "User permenantely deleted successfully"
                    })
                } else {
                    return res.status(200).json({
                        success: false,
                        statusCode: 400,
                        message: "User deletion failed"
                    });
                }
            } else {
                return res.status(200).json({
                    success: false,
                    statusCode: 400,
                    message: "Missing required fields"
                });
            }

        } catch (err) {
            return res.status(500).json({
                success: false,
                statusCode: 500,
                message: "Internal Server Error"
            })
        }
    }
}