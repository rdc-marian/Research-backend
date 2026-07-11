"use strict";

const { asyncHandler } = require("./asyncHandler");
/**
 * Reusable CRUD controller factory for all portfolio accomplishment categories.
 * Reduces code redundancy while keeping implementations consistent.
 *
 * @param {import("mongoose").Model} Model - The Mongoose Model class
 * @param {string} modelName - The name of the model for logging and error reporting
 */
const createAccomplishmentController = (Model, modelName) => {
    return {
        // 1. Get all items, optionally filtered by scholarId
        getAll: asyncHandler(async (req, res) => {
            const { scholarId, search, status, page, limit } = req.query;
            const query = scholarId ? { scholar: scholarId } : {};

            if (status) {
                query.verificationStatus = status;
            }

            if (search) {
                const regex = new RegExp(search, "i");
                const searchFields = [{ title: regex }];
                
                if (modelName === "Patent") {
                    searchFields.push({ patentTitle: regex }, { patentNumber: regex });
                }
                if (modelName === "Publication") {
                    searchFields.push({ journalName: regex });
                }
                query.$or = searchFields;
            }

            // Pagination
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            const skip = (pageNum - 1) * limitNum;

            const total = await Model.countDocuments(query);
            const items = await Model.find(query)
                .populate("scholar", "name email department guide")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum);

            res.json({
                items,
                pagination: {
                    total,
                    page: pageNum,
                    limit: limitNum,
                    pages: Math.ceil(total / limitNum),
                },
            });
        }),
        // 2. Get one item by ID
        getOne: asyncHandler(async (req, res) => {
            const { id } = req.params;
            const item = await Model.findById(id).populate("scholar", "name email department guide");
            if (!item) {
                return res.status(404).json({ message: `${modelName} not found` });
            }
            res.json({ item });
        }),
        // 3. Create a new item (handles optional file upload)
        create: asyncHandler(async (req, res) => {
            const { scholarId } = req.body;
            if (!scholarId) {
                return res.status(400).json({ message: "scholarId is required" });
            }
            // Convert body to Mongoose schema data format
            const bodyData = { ...req.body, scholar: scholarId };
            delete bodyData.scholarId;
            if (req.file) {
                bodyData.document = {
                    url: `/api/uploads/${req.file.filename}`,
                    publicId: req.file.filename,
                    originalName: req.file.originalname,
                    mimeType: req.file.mimetype,
                    size: req.file.size,
                };
            }
            bodyData.verificationStatus = "Pending";
            const item = await Model.create(bodyData);
            const populated = await Model.findById(item._id).populate("scholar", "name email department guide");
            res.status(201).json({ item: populated });
        }),
        // 4. Update an item (handles optional file upload)
        update: asyncHandler(async (req, res) => {
            const { id } = req.params;
            const updates = { ...req.body };
            if (updates.scholarId) {
                updates.scholar = updates.scholarId;
                delete updates.scholarId;
            }
            if (req.file) {
                updates.document = {
                    url: `/api/uploads/${req.file.filename}`,
                    publicId: req.file.filename,
                    originalName: req.file.originalname,
                    mimeType: req.file.mimetype,
                    size: req.file.size,
                };
            }
            // Reset verification state on edits so it needs to be approved again
            updates.verificationStatus = "Pending";
            updates.guideNote = undefined;
            updates.verifiedBy = undefined;
            updates.verifiedAt = undefined;
            const item = await Model.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
                .populate("scholar", "name email department guide");
            if (!item) {
                return res.status(404).json({ message: `${modelName} not found` });
            }
            res.json({ item });
        }),
        // 5. Approve/reject (update verificationStatus & review notes)
        updateStatus: asyncHandler(async (req, res) => {
            const { id } = req.params;
            const { status, note, reviewerId } = req.body;
            if (!status) {
                return res.status(400).json({ message: "status is required" });
            }
            const allowedStatuses = ["Pending", "Approved", "Rejected"];
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({ message: `Invalid verification status: ${status}` });
            }
            const updates = {
                verificationStatus: status,
                guideNote: note,
                verifiedBy: reviewerId || undefined,
                verifiedAt: status === "Pending" ? null : new Date(),
            };
            const item = await Model.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
                .populate("scholar", "name email department guide");
            if (!item) {
                return res.status(404).json({ message: `${modelName} not found` });
            }
            res.json({ item });
        }),
        // 6. Delete an item
        delete: asyncHandler(async (req, res) => {
            const { id } = req.params;
            const item = await Model.findByIdAndDelete(id);
            if (!item) {
                return res.status(404).json({ message: `${modelName} not found` });
            }
            res.json({ message: "Success" });
        }),
    };
};
module.exports = createAccomplishmentController;
